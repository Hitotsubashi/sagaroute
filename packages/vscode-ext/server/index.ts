import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
  _Connection,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import ts from 'typescript';
import fs from 'fs';
import { throttle } from 'lodash';
import getRouteStringLiteral from './get-route-string';
import getRouteRangeRecorder, { RouteRange } from './RouteRangeRecorder';

let service: ts.LanguageService;
let workspaceRootFolderPath: string;
let currentTextDocument: TextDocument;
let currentTextDocumentUriWithoutFilePrefix: string;
let alreadyInitTSServer = false;
let connection: _Connection;

function getPath(fpath: string) {
  return fpath.slice('file://'.length);
}

function getFPath(path: string) {
  return 'file://' + path;
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
    getScriptFileNames: () => [currentTextDocumentUriWithoutFilePrefix],
    // getAllTsFiles(path.join(getPath(workspaceRootFolderPath), 'src')),
    getScriptKind: (fileName) => {
      return fileName.substr(fileName.length - 2) === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
    },
    // TODO: 思考非currentTextDocument的文件版本恒为1时时候会出现问题
    getScriptVersion: (fileName: string) => {
      if (fileName === currentTextDocumentUriWithoutFilePrefix) {
        return String(currentTextDocument.version);
      }
      return '0';
    },
    getScriptSnapshot: (fileName: string) => {
      if (fileName === currentTextDocumentUriWithoutFilePrefix) {
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
    getCurrentDirectory: () => getPath(workspaceRootFolderPath),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    readFile: function (path: string): string | undefined {
      if (path === currentTextDocumentUriWithoutFilePrefix) {
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
  connection = createConnection(ProposedFeatures.all);
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

  function changeCurrentTextDocument(uri: string) {
    const activeDocument = documents.get(uri);
    if (activeDocument) {
      currentTextDocument = activeDocument;
      currentTextDocumentUriWithoutFilePrefix = getPath(currentTextDocument.uri);
      initTSService();
    }
  }

  connection.onInitialized(() => {
    connection.sendRequest('activeTextEditor/uri').then((uri) => {
      console.log('onInitialized', uri);
      if (typeof uri === 'string') {
        changeCurrentTextDocument(uri);
        getRanges();
      }
    });
  });

  connection.onNotification('activeTextEditor/uri', (uri) => {
    changeCurrentTextDocument(uri);
    getRanges();
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
    if (!record || record.version !== currentTextDocument.version) {
      const program = service.getProgram();
      if (program) {
        const typeChecker = program.getTypeChecker();
        const sourceFile = program.getSourceFile(currentTextDocumentUriWithoutFilePrefix);
        if (sourceFile) {
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
    }
    setDecoration();
  },
  500,
  { trailing: true },
);

function setDecoration() {
  const routeRangeRecorder = getRouteRangeRecorder();
  const record = routeRangeRecorder.get(currentTextDocument.uri);
  if (record) {
    connection.sendNotification('activeTextEditor/decorations', {
      uri: currentTextDocument.uri,
      ranges: record.ranges,
    });
  }
}

initConnection();
