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
// import * as vscode from 'vscode';

let service: ts.LanguageService;
let workspaceRootFolderPath: string;
let currentTextDocument: TextDocument;

function initTSService() {
  const compilerOptions: ts.CompilerOptions = {
    allowNonTsExtensions: true,
    allowJs: true,
    lib: ['lib.es2020.full.d.ts'],
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.Classic,
    experimentalDecorators: false,
  };
  service = ts.createLanguageService({
    getCompilationSettings: () => compilerOptions,
    getScriptFileNames: () => [currentTextDocument.uri],
    getScriptKind: (fileName) => {
      return fileName.substr(fileName.length - 2) === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
    },
    getScriptVersion: (fileName: string) => {
      if (fileName === currentTextDocument.uri) {
        return String(currentTextDocument.version);
      }
      return '1';
    },
    getScriptSnapshot: (fileName: string) => {
      let text = '';
      if (fileName === currentTextDocument.uri) {
        text = currentTextDocument.getText();
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
    getCurrentDirectory: () => workspaceRootFolderPath,
    getDefaultLibFileName: () => 'es2020.full',
    readFile: function (path: string): string | undefined {
      if (path === currentTextDocument.uri) {
        return currentTextDocument.getText();
      } else {
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
      console.log(activeDocument.version);
      currentTextDocument = activeDocument;
    }
  });

  documents.onDidChangeContent(() => {
    console.log(currentTextDocument?.version);

    // console.log('change', e.document.uri);
    // console.log('change', e.document.getText());
    // test();
  });

  documents.listen(connection);

  connection.listen();
}

// function test() {
//   const program = service.getProgram();
//   const typeChecker = program?.getTypeChecker();
//   const sourceFile = program?.getSourceFile(currentTextDocument.uri) as ts.SourceFile;
//   console.log(sourceFile.getFullText());
// }

initTSService();
initConnection();
