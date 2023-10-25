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
import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import ts from 'typescript';
import fs from 'fs';
import { throttle } from 'lodash';
import getRouteStringLiteral from './get-route-string';
import getRouteRangeRecorder, { RouteRange } from './RouteRangeRecorder';
import getRouteFileRelationManager, { ModifedRouteObject } from './RouteFileRelationManager';
import getPathParseManager from './PathParseManager';
import getJSDocManager from './JSDocManager';
import getPathCompletionItemManager from './PathCompletionItemManager';
import url from 'url';
import path from 'path';
import getIgnoreRangeRecorder from './IgnoreRangeRecorder';
import getIgnoreCommentRanges from './get-ignore-comment';

let service: ts.LanguageService;
let workspaceRootFolderPath: string;
let currentTextDocument: TextDocument;
let alreadyInitTSServer = false;
let connection: _Connection;
let documents: TextDocuments<TextDocument>;
let enabled = false;

function getPath(fpath: string) {
  return url.fileURLToPath(fpath).replaceAll(path.sep, '/');
}

function getFPath(path: string) {
  return url.pathToFileURL(path).toString();
}

function getCurrentTextDocumentPath() {
  return getPath(currentTextDocument.uri);
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
    getScriptFileNames: () => [getCurrentTextDocumentPath()],
    getScriptKind: (fileName) => {
      return fileName.substr(fileName.length - 2) === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
    },
    getScriptVersion: (fileName: string) => {
      if (fileName === getCurrentTextDocumentPath()) {
        return String(currentTextDocument.version);
      }
      return '0';
      // else {
      //   const document = documents.get(getFPath(fileName));
      //   return document?.version.toString() || '0';
      // }
    },
    getScriptSnapshot: (fileName: string) => {
      if (fileName === getCurrentTextDocumentPath()) {
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
      if (path === getCurrentTextDocumentPath()) {
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
      initTSService();
    }
  }

  connection.onInitialized(() => {
    connection.sendRequest('activeTextEditor/uri').then((uri) => {
      if (typeof uri === 'string') {
        changeCurrentTextDocument(uri);
        handleParse();
      }
    });
  });

  connection.onNotification('activeTextEditor/uri', (uri) => {
    changeCurrentTextDocument(uri);
    handleParse();
  });

  connection.onNotification('route/build', (result: { routes: ModifedRouteObject[] }) => {
    enabled = true;
    const routeFileRelationManager = getRouteFileRelationManager();
    routeFileRelationManager.setRoutes(result.routes);
    routeFileRelationManager.buildMap();
    const pathParseManager = getPathParseManager();
    pathParseManager.compute();
    const pathCompletionItemManager = getPathCompletionItemManager();
    pathCompletionItemManager.generateAbsoluteCompletions();
    handleParse();
  });

  connection.onRequest('url/parse', (pathname) => {
    const pathParseManager = getPathParseManager();
    const filepath = pathParseManager.parse(pathname);
    return filepath;
  });

  connection.onCompletion(({ textDocument, position }) => {
    if (!enabled) {
      return;
    }
    parseRanges();
    const { uri } = textDocument;
    const range = findMatchedRange(uri, position);
    if (range) {
      const pathCompletionItemManager = getPathCompletionItemManager();
      if (range.text === '/') {
        return pathCompletionItemManager.getCompletions();
      } else {
        const currentRoute = generateCurrentRoute(range.text);
        if (currentRoute) {
          return pathCompletionItemManager.getCompletions(currentRoute);
        }
      }
    }
  });

  function findMatchedRange(uri: string, position: Position) {
    const routeRangeRecorder = getRouteRangeRecorder();
    const result = routeRangeRecorder.get(uri);
    if (result) {
      const { ranges } = result;
      const { line, character } = position;
      return ranges.find(
        ({ startLine, startCharacter, endLine, endCharacter }) =>
          startLine === line &&
          endLine === line &&
          startCharacter <= character &&
          character <= endCharacter,
      );
    }
    return undefined;
  }

  connection.onCompletionResolve(async (completion: CompletionItem) => {
    if (!enabled) {
      return completion;
    }
    const { filepath } = completion.data;
    if (filepath) {
      const jsDocManager = getJSDocManager();
      const jsdoc = await jsDocManager.getJSDoc(filepath);
      const markdownContents = [
        `**${filepath.slice(getPath(workspaceRootFolderPath).length + 1)}**`,
      ];
      if (jsdoc) {
        markdownContents.push('```typescript', jsdoc, '```');
      }
      completion.documentation = {
        kind: 'markdown',
        value: markdownContents.join('\n'),
      };
    }
    return completion;
  });

  connection.onHover(async ({ textDocument, position }) => {
    if (!enabled) {
      return;
    }
    const { uri } = textDocument;
    const range = findMatchedRange(uri, position);
    if (range) {
      const pathParseManager = getPathParseManager();
      const routepath = range.text.startsWith('/') ? range.text : generateCurrentRoute(range.text);
      if (routepath) {
        const path = pathParseManager.parse(routepath);
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
  });

  connection.onDefinition(({ textDocument, position }) => {
    if (!enabled) {
      return;
    }
    const { uri } = textDocument;
    const range = findMatchedRange(uri, position);
    if (range) {
      const pathParseManager = getPathParseManager();
      const routepath = range.text.startsWith('/') ? range.text : generateCurrentRoute(range.text);
      if (routepath) {
        const path = pathParseManager.parse(routepath);
        if (path) {
          return Location.create(getFPath(path), Range.create(0, 0, 0, 0));
        }
      }
    }
  });

  documents.onDidChangeContent((e) => {
    if (currentTextDocument?.uri === e.document.uri) {
      handleParse();
    }
  });

  documents.onDidClose((e) => {
    connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
  });

  documents.listen(connection);

  connection.listen();
}

function parseIgnoreRanges() {
  if (!enabled) {
    return;
  }
  const ignoreRangeRecorder = getIgnoreRangeRecorder();
  const record = ignoreRangeRecorder.get(currentTextDocument.uri);
  if (!record || record.version !== currentTextDocument.version) {
    const program = service.getProgram();
    if (program) {
      const sourceFile = program.getSourceFile(getCurrentTextDocumentPath());
      if (sourceFile) {
        const ignoreComments = getIgnoreCommentRanges(sourceFile);
        ignoreRangeRecorder.set(currentTextDocument.uri, {
          version: currentTextDocument.version,
          ignoreWhole: ignoreComments.some(({ whole }) => whole),
          lines: ignoreComments.map(({ end }) => currentTextDocument.positionAt(end).line + 1),
        });
      }
    }
  }
}

function parseRanges() {
  if (!enabled) {
    return;
  }
  const routeRangeRecorder = getRouteRangeRecorder();
  const record = routeRangeRecorder.get(currentTextDocument.uri);
  if (!record || record.version !== currentTextDocument.version) {
    const program = service.getProgram();
    if (program) {
      const typeChecker = program.getTypeChecker();
      const sourceFile = program.getSourceFile(getCurrentTextDocumentPath());
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
}

function generateCurrentRoute(routeText: string) {
  const routeFileRelationManager = getRouteFileRelationManager();
  const filepath =
    routeFileRelationManager.getFilePathToRoutePathMap()[
      getCurrentTextDocumentPath().replaceAll('/', path.sep)
    ];
  if (filepath) {
    const baseroute = routeText.startsWith('/') ? '' : filepath;
    return path.join(baseroute, routeText).replace(path.sep, '/');
  }
  return null;
}

const handleParse = throttle(
  () => {
    parseIgnoreRanges();
    parseRanges();
    setDecoration();
    setDiagnostic();
  },
  500,
  { trailing: true },
);

function setDiagnostic() {
  const ignoreRangeRecorder = getIgnoreRangeRecorder();
  const ignoreRecord = ignoreRangeRecorder.get(currentTextDocument.uri);
  if (ignoreRecord?.ignoreWhole) {
    connection.sendDiagnostics({ uri: currentTextDocument.uri, diagnostics: [] });
    return;
  }
  const ignoreLines = ignoreRecord?.lines;
  const routeRangeRecorder = getRouteRangeRecorder();
  const record = routeRangeRecorder.get(currentTextDocument.uri);
  if (record) {
    const pathParseManager = getPathParseManager();
    const noMatchedRouteRanges = record.ranges.filter(({ text, startLine }) => {
      const routepath = text.startsWith('/') ? text : generateCurrentRoute(text);
      return (
        !ignoreLines?.includes(startLine) && (!routepath || !pathParseManager.parse(routepath))
      );
    });
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
