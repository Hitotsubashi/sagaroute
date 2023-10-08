import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import ts from 'typescript';
import fs from 'fs';
import { throttle } from 'lodash';
import getRouteStringLiteral from './get-route-string';
import getRouteRangeRecorder, { RouteRange } from './RouteRangeRecorder';
import path from 'path';

let service: ts.LanguageService;
let workspaceRootFolderPath: string;
let currentTextDocument: TextDocument;
let alreadyInitTSServer = false;

function getAllTsFiles(dirPath: string) {
  const files = fs.readdirSync(dirPath);

  let tsFiles: string[] = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      tsFiles = [...tsFiles, ...getAllTsFiles(filePath)];
    } else if (filePath.toLowerCase().endsWith('.ts') || filePath.toLowerCase().endsWith('.tsx')) {
      tsFiles.push(filePath);
    }
  });

  return tsFiles;
}

function removeFilePrefix(fpath: string) {
  return fpath.slice('file://'.length);
}

function initTSService() {
  if (alreadyInitTSServer) {
    return;
  }
  alreadyInitTSServer = true;
  const compilerOptions: ts.CompilerOptions = {
    // allowNonTsExtensions: true,
    allowJs: true,
    // target: ts.ScriptTarget.Latest,
    // moduleResolution: ts.ModuleResolutionKind.Classic,
    // experimentalDecorators: false,
  };
  service = ts.createLanguageService({
    getCompilationSettings: () => compilerOptions,
    getScriptFileNames: () =>
      getAllTsFiles(path.join(removeFilePrefix(workspaceRootFolderPath), 'src')),
    getScriptKind: (fileName) => {
      return fileName.substr(fileName.length - 2) === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
    },
    // TODO: 思考非currentTextDocument的文件版本恒为1时时候会出现问题
    getScriptVersion: (fileName: string) => {
      if (fileName === removeFilePrefix(currentTextDocument.uri)) {
        return String(currentTextDocument.version);
      }
      return '1';
    },
    getScriptSnapshot: (fileName: string) => {
      console.log('getScriptSnapshot', fileName);
      if (fileName === removeFilePrefix(currentTextDocument.uri)) {
        const text = currentTextDocument.getText();
        return {
          getText: (start, end) => text.substring(start, end),
          getLength: () => text.length,
          getChangeRange: () => undefined,
        };
      } else {
        if (!fs.existsSync(fileName)) {
          return undefined;
        }
        return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
      }
    },
    getCurrentDirectory: () => removeFilePrefix(workspaceRootFolderPath),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    readFile: function (path: string): string | undefined {
      console.log('path', path);
      if (path === removeFilePrefix(currentTextDocument.uri)) {
        return currentTextDocument.getText();
      } else {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        return ts.sys.readFile.apply(null, arguments);
      }
    },
    fileExists: ts.sys.fileExists,
  });
}

function initConnection() {
  const connection = createConnection(ProposedFeatures.all);
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  connection.onInitialize((params) => {
    workspaceRootFolderPath = params.workspaceFolders![0].uri;
    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
      },
    };
    return result;
  });

  connection.onNotification('window/activeTextEditor', (uri) => {
    const activeDocument = documents.get(uri);
    if (activeDocument) {
      currentTextDocument = activeDocument;
      initTSService();
    }
  });

  documents.onDidChangeContent((e) => {
    if (currentTextDocument?.uri === e.document.uri) {
      getRanges();
    }
  });

  documents.listen(connection);

  connection.listen();
}

const getRanges = throttle(
  () => {
    const routeRangeRecorder = getRouteRangeRecorder();
    const record = routeRangeRecorder.get(currentTextDocument.uri);
    if (record && record.version === currentTextDocument.version) {
      return;
    }
    const program = service.getProgram();
    if (program) {
      const typeChecker = program.getTypeChecker();
      const sourceFile = program.getSourceFile(removeFilePrefix(currentTextDocument.uri));
      if (sourceFile) {
        console.log('sourceFile.getFullText()', sourceFile.getFullText());
        const routeStringLiterals = getRouteStringLiteral(sourceFile, typeChecker);
        const ranges: RouteRange[] = routeStringLiterals.map(({ pos, end }) => {
          const { line: startLine, character: startCharacter } =
            currentTextDocument.positionAt(pos);
          const { line: endLine, character: endCharacter } = currentTextDocument.positionAt(end);
          return {
            startLine,
            startCharacter,
            endLine,
            endCharacter,
          };
        });
        console.log(ranges);
        routeRangeRecorder.set(currentTextDocument.uri, ranges, currentTextDocument.version);
      }
    }
  },
  500,
  { trailing: true },
);

initConnection();
