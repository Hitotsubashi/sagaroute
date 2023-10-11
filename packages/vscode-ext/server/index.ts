import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
  Location,
  Range,
  _Connection,
  CompletionItem,
  Diagnostic,
  DiagnosticSeverity,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import ts from 'typescript';
import fs from 'fs';
import { throttle } from 'lodash';
import getRouteStringLiteral from './get-route-string';
import getRouteRangeRecorder, { RouteRange } from './RouteRangeRecorder';
import getRouteFileRelationManager, { ModifedRouteObject } from './RouteFileRelationManager';
import getPathParseManager from './PathParseManager';
import getJSDocManager from './JSDocManager';
import getPathCompletionItemManager from './PathCompletionItemManager';

let service: ts.LanguageService;
let workspaceRootFolderPath: string;
let currentTextDocument: TextDocument;
let currentTextDocumentUriWithoutFilePrefix: string;
let alreadyInitTSServer = false;
let connection: _Connection;
let documents: TextDocuments<TextDocument>;

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
    getScriptKind: (fileName) => {
      return fileName.substr(fileName.length - 2) === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
    },
    // TODO: 思考非currentTextDocument的文件版本恒为1时时候会出现问题
    getScriptVersion: (fileName: string) => {
      if (fileName === currentTextDocumentUriWithoutFilePrefix) {
        return String(currentTextDocument.version);
      }
      return '0';
      // else {
      //   const document = documents.get(getFPath(fileName));
      //   return document?.version.toString() || '0';
      // }
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
  documents = new TextDocuments(TextDocument);
  connection.onInitialize((params) => {
    workspaceRootFolderPath = params.workspaceFolders![0].uri;
    const result: InitializeResult = {
      capabilities: {
        definitionProvider: true,
        hoverProvider: true,
        completionProvider: {
          triggerCharacters: ['/'],
          resolveProvider: true,
          completionItem: {
            labelDetailsSupport: true,
          },
        },
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
      if (typeof uri === 'string') {
        changeCurrentTextDocument(uri);
        parseRanges();
      }
    });
  });

  connection.onNotification('activeTextEditor/uri', (uri) => {
    changeCurrentTextDocument(uri);
    parseRanges();
  });

  connection.onNotification('route/build', (result: { routes: ModifedRouteObject[] }) => {
    const routeFileRelationManager = getRouteFileRelationManager();
    routeFileRelationManager.setRoutes(result.routes);
    routeFileRelationManager.buildMap();
    const pathParseManager = getPathParseManager();
    pathParseManager.compute();
    const pathCompletionItemManager = getPathCompletionItemManager();
    pathCompletionItemManager.generateCompletions();
  });

  connection.onRequest('url/parse', (pathname) => {
    const pathParseManager = getPathParseManager();
    const filepath = pathParseManager.parse(pathname);
    return filepath;
  });

  connection.onCompletion(({ textDocument, position }) => {
    const { uri } = textDocument;
    const routeRangeRecorder = getRouteRangeRecorder();
    const result = routeRangeRecorder.get(uri);
    if (result) {
      const { ranges } = result;
      const { line, character } = position;
      const range = ranges.find(
        ({ startLine, startCharacter, endLine, endCharacter }) =>
          startLine === line &&
          endLine === line &&
          startCharacter <= character &&
          character <= endCharacter,
      );
      if (range) {
        const pathCompletionItemManager = getPathCompletionItemManager();
        return pathCompletionItemManager.getCompletions();
      }
    }
  });

  connection.onCompletionResolve(async (completion: CompletionItem) => {
    const routeFileRelationManager = getRouteFileRelationManager();
    const filepath = routeFileRelationManager.getRoutePathToFilePathMap()[completion.label]!;
    const jsDocManager = getJSDocManager();
    const jsdoc = await jsDocManager.getJSDoc(filepath);
    const markdownContents = [`**${filepath.slice(getPath(workspaceRootFolderPath).length + 1)}**`];
    if (jsdoc) {
      markdownContents.push('```typescript', jsdoc, '```');
    }
    completion.documentation = {
      kind: 'markdown',
      value: markdownContents.join('\n'),
    };
    return completion;
  });

  connection.onHover(async ({ textDocument, position }) => {
    const { uri } = textDocument;
    const routeRangeRecorder = getRouteRangeRecorder();
    const result = routeRangeRecorder.get(uri);
    if (result) {
      const { ranges } = result;
      const { line, character } = position;
      const range = ranges.find(
        ({ startLine, startCharacter, endLine, endCharacter }) =>
          startLine === line &&
          endLine === line &&
          startCharacter <= character &&
          character <= endCharacter,
      );
      if (range) {
        const pathParseManager = getPathParseManager();
        const path = pathParseManager.parse(range.text);
        if (path) {
          const jsDocManager = getJSDocManager();
          const jsdoc = await jsDocManager.getJSDoc(path);
          const markdownContents = [
            `**${path.slice(getPath(workspaceRootFolderPath).length + 1)}**`,
          ];
          if (jsdoc) {
            markdownContents.push('```typescript', jsdoc, '```');
          }
          return {
            contents: {
              kind: 'markdown',
              value: markdownContents.join('\n'),
            },
            range: Range.create(
              range.startLine,
              range.startCharacter,
              range.endLine,
              range.endCharacter,
            ),
          };
        }
      }
    }
    return undefined;
  });

  connection.onDefinition(({ textDocument, position }) => {
    const { uri } = textDocument;
    const routeRangeRecorder = getRouteRangeRecorder();
    const result = routeRangeRecorder.get(uri);
    if (result) {
      const { ranges } = result;
      const { line, character } = position;
      const range = ranges.find(
        ({ startLine, startCharacter, endLine, endCharacter }) =>
          startLine === line &&
          endLine === line &&
          startCharacter <= character &&
          character <= endCharacter,
      );
      if (range) {
        const pathParseManager = getPathParseManager();
        const path = pathParseManager.parse(range.text);
        if (path) {
          return Location.create(getFPath(path), Range.create(0, 0, 0, 0));
        }
      }
    }
    return undefined;
  });

  documents.onDidChangeContent((e) => {
    if (currentTextDocument?.uri === e.document.uri) {
      parseRanges();
    }
  });

  documents.listen(connection);

  connection.listen();
}

const parseRanges = throttle(
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
          const ranges: RouteRange[] = routeStringLiterals.map(({ pos, end, text }) => {
            const { line: startLine, character: startCharacter } =
              currentTextDocument.positionAt(pos);
            const { line: endLine, character: endCharacter } = currentTextDocument.positionAt(end);
            return {
              startLine,
              startCharacter,
              endLine,
              endCharacter,
              text,
            };
          });
          routeRangeRecorder.set(currentTextDocument.uri, ranges, currentTextDocument.version);
        }
      }
    }
    setDecoration();
    setDiagnostic();
  },
  500,
  { trailing: true },
);

function setDiagnostic() {
  const routeRangeRecorder = getRouteRangeRecorder();
  const record = routeRangeRecorder.get(currentTextDocument.uri);
  if (record) {
    const pathParseManager = getPathParseManager();
    const noMatchedRouteRanges = record.ranges.filter(({ text }) => !pathParseManager.parse(text));
    const diagnostics = noMatchedRouteRanges.map((range) =>
      Diagnostic.create(
        Range.create(range.startLine, range.startCharacter, range.endLine, range.endCharacter),
        `The path [${range.text}] has no matched route.`,
        DiagnosticSeverity.Warning,
      ),
    );
    connection.sendDiagnostics({ uri: currentTextDocument.uri, diagnostics });
  }
}

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
