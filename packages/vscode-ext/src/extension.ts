import { FSWatcher } from 'chokidar';
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as path from 'path';
import debounce from 'lodash/debounce';
import getSagaRoute, { rebuildSagaroute } from './SagaRoute';
import getLogging from './Logging';
import { performance } from 'perf_hooks';
import getCacheManager from './CacheManager';
// import getPathCompletionItemManager from './PathCompletionItemManager';
import getWarningManager from './WarningManager';
// import getJSDocManager from './JSDocManager';
import urlRegex from 'url-regex';
// import getRouteFileRelationManager from './RouteFileRelationManager';
// import getPathParseManager from './PathParseManager';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let isEnabled: boolean;
let routingWatcher: FSWatcher;
let configWatcher: vscode.FileSystemWatcher;
let statusBarItem: vscode.StatusBarItem;

const workspaceRootFolderPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

function adjustSagarouteBarItemSurface() {
  if (isEnabled) {
    statusBarItem.text = '$(debug-rerun) Sagaroute Watching';
    statusBarItem.color = '#95de64';
  } else {
    statusBarItem.text = '$(close) Sagaroute Sleeping';
    statusBarItem.color = '#ffffff';
  }
}

function initStatusBar(context: vscode.ExtensionContext) {
  const settingConfiguration = vscode.workspace.getConfiguration('sagaroute');

  function toggleStatus() {
    settingConfiguration.update('working', !isEnabled);
  }

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
  statusBarItem.show();
  statusBarItem.command = 'sagaroute.toggle';
  adjustSagarouteBarItemSurface();
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(vscode.commands.registerCommand('sagaroute.toggle', toggleStatus));
}

function initInputCommand(context: vscode.ExtensionContext) {
  const logging = getLogging();
  const routingCommand = vscode.commands.registerCommand('sagaroute.routing', () => {
    const cacheManger = getCacheManager();
    cacheManger.clearAll();
    working();
  });
  const rebuildCommand = vscode.commands.registerCommand('sagaroute.rebuild', () => {
    rebuildSagaroute();
    initRoutingWatcher(true);
  });
  const openOutputCommand = vscode.commands.registerCommand('sagaroute.show', () => {
    logging.show();
  });
  context.subscriptions.push(routingCommand, rebuildCommand, openOutputCommand);
}

function initConfigWatcher() {
  const watchPath = path
    .join(workspaceRootFolderPath, 'sagaroute.config.{js,cjs}')
    .replace(path.sep, '/');
  configWatcher = vscode.workspace.createFileSystemWatcher(watchPath);
  const eventHandle = (type: string, uri: vscode.Uri) => {
    const logging = getLogging();
    logging.logMessage(`[watch] File ${uri.toString()} has been ${type}`);
    rebuildSagaroute();
    initRoutingWatcher(true);
  };
  configWatcher.onDidChange((uri) => eventHandle('change', uri));
  configWatcher.onDidCreate((uri) => eventHandle('create', uri));
  configWatcher.onDidDelete((uri) => eventHandle('delete', uri));
}

function working() {
  const logging = getLogging();
  const sagaRoute = getSagaRoute();
  if (sagaRoute.error) {
    return;
  }
  const cacheManger = getCacheManager();
  try {
    const startTime = performance.now();
    logging.logMessage('Sagaroute start working');
    sagaRoute.routing();
    const warningManager = getWarningManager();
    if (warningManager.hasMessages()) {
      logging.logMessage(
        `Sagaroute finished,  but there are the following problems:\n${warningManager
          .getMessages()
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n')}`,
        'WARN',
      );
      vscode.window.showWarningMessage(
        'Sagaroute finished, but there are some warning problems, Click [here](command:sagaroute.show) to view detail from Sagaroute Output',
      );
      warningManager.clear();
      cacheManger.clearAll();
    } else {
      const endTime = performance.now();
      logging.logMessage(`Sagaroute finished in ${Math.round(endTime - startTime)}ms`);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(err.message);
    logging.logMessage(err.message, 'ERROR');
    cacheManger.clearAll();
    console.log(err);
  }
}

function initRoutingWatcher(immediate = false) {
  const cacheManger = getCacheManager();
  cacheManger.clearAll();

  const debounceWorking = debounce(working, 30);

  if (routingWatcher) {
    routingWatcher.close();
  }

  if (immediate) {
    debounceWorking();
  }

  routingWatcher = chokidar
    .watch(workspaceRootFolderPath, {
      ignoreInitial: true,
      ignored: [
        (value: string) => {
          const sagaRoute = getSagaRoute();
          if (sagaRoute.error) {
            return false;
          }
          const normalizedPath = value.replaceAll('/', path.sep);
          const dirpath = sagaRoute.options.dirpath;
          const layoutDirPath = sagaRoute.options.layoutDirPath;

          return !(
            ['', '.tsx', '.jsx', '.ts', '.js'].includes(path.extname(value)) &&
            (dirpath.startsWith(normalizedPath) ||
              layoutDirPath.startsWith(normalizedPath) ||
              normalizedPath.startsWith(dirpath) ||
              normalizedPath.startsWith(layoutDirPath))
          );
        },
      ],
    })
    .on('all', (event, filepath) => {
      if (isEnabled && ['add', 'change', 'unlink'].includes(event)) {
        switch (event) {
          case 'change':
            cacheManger.addDirty(filepath);
            break;
          case 'unlink':
            cacheManger.deleteCache(filepath);
            break;
          default:
            break;
        }
        const logging = getLogging();
        logging.logMessage(`[watch] File ${filepath} has been ${event}`);
        debounceWorking();
      }
    });
}

// function registerRouteCompletions(context: vscode.ExtensionContext) {
//   const documentSelector: vscode.DocumentSelector = [
//     { scheme: 'file', language: 'typescript' },
//     { scheme: 'file', language: 'typescriptreact' },
//     { scheme: 'file', language: 'javascript' },
//     { scheme: 'file', language: 'javascriptreact' },
//   ];
//   const pathCompletionItemManager = getPathCompletionItemManager();
//   const routeFileRelationManager = getRouteFileRelationManager();

//   context.subscriptions.push(
//     vscode.languages.registerCompletionItemProvider(
//       documentSelector,
//       {
//         provideCompletionItems(document, position) {
//           const line = document.lineAt(position.line).text;
//           if (line.slice(0, position.character).endsWith('//')) {
//             const completions = pathCompletionItemManager.getCompletions();
//             completions.forEach((item) => {
//               item.additionalTextEdits = [
//                 vscode.TextEdit.replace(
//                   new vscode.Range(
//                     position.line,
//                     position.character - 2,
//                     position.line,
//                     position.character,
//                   ),
//                   '',
//                 ),
//               ];
//             });
//             return completions;
//           }
//           return undefined;
//         },
//         async resolveCompletionItem(item) {
//           const route = item.label as string;
//           const fpath = routeFileRelationManager.getRoutePathToFilePathMap()[route];
//           if (fpath) {
//             const jsDocManager = getJSDocManager();
//             const jsdoc = await jsDocManager.getJSDoc(fpath);
//             if (jsdoc) {
//               (item.documentation as vscode.MarkdownString).appendCodeblock(jsdoc, 'javascript');
//             }
//           }
//           return item;
//         },
//       },
//       '/',
//     ),
//   );
// }

function initListenWorkspaceConfiguration(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration('sagaroute.working')) {
        isEnabled = vscode.workspace.getConfiguration('sagaroute').get('working') as boolean;
        const logging = getLogging();
        logging.logMessage(`sagaroute ${isEnabled ? 'watching' : 'sleeping'}`);
        if (isEnabled) {
          working();
        }
        adjustSagarouteBarItemSurface();
      }
    }),
  );
}

interface RouteRange {
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
}

function initListenRouteDecoration(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    client.onNotification('activeTextEditor/decorations', (response) => {
      const settingConfiguration = vscode.workspace.getConfiguration('sagaroute');
      const decorationStyle = (settingConfiguration.get('decoration') as typeof Proxy) || {};
      const { uri, ranges } = response as { uri: string; ranges: RouteRange[] };
      if (vscode.Uri.parse(uri).path === vscode.window.activeTextEditor?.document.uri.fsPath) {
        const decorationType = vscode.window.createTextEditorDecorationType({
          color: '#69b1ff',
          backgroundColor: 'transparent',
          ...decorationStyle,
        });
        vscode.window.activeTextEditor?.setDecorations(
          decorationType,
          ranges.map(({ startLine, startCharacter, endLine, endCharacter }) => ({
            range: new vscode.Range(startLine, startCharacter, endLine, endCharacter),
          })),
        );
      }
    }),
  );
}

function initSendServerWithActiveTextEditor(context: vscode.ExtensionContext) {
  function getUriFromDocument(document?: vscode.TextDocument) {
    if (document) {
      const fsPath = document.uri.fsPath;
      const { ext } = path.parse(fsPath);
      if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
        return `file://${fsPath}`;
      }
    }
    return undefined;
  }

  context.subscriptions.push(
    client.onRequest('activeTextEditor/uri', () => {
      const activeUri = getUriFromDocument(vscode.window.activeTextEditor?.document);
      return activeUri;
    }),
  );

  // const activeUri = getUriFromDocument(vscode.window.activeTextEditor?.document);
  // if (activeUri) {
  //   setTimeout(() => {
  //     client.sendNotification('activeTextEditor/uri', activeUri);
  //   }, 1500);
  // }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e) => {
      const activeUri = getUriFromDocument(e?.document);
      if (activeUri) {
        client.sendNotification('activeTextEditor/uri', activeUri);
      }
    }),
  );
}

function initParseUrlCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('sagaroute.parse', async () => {
      const input = await vscode.window.showInputBox({ placeHolder: 'Please enter the url.' });
      if (typeof input === 'string') {
        if (!urlRegex().test(input)) {
          vscode.window.showErrorMessage(
            `The  content <${input}> you entered does not match the url format.`,
          );
          return;
        }
        const url = new URL(input);
        const fpath = (await client.sendRequest(
          'url/parse',
          url.hash.startsWith('#/') ? url.hash.slice(1) : url.pathname,
        )) as string | undefined;
        if (!fpath) {
          vscode.window.showErrorMessage(
            `The file matching the entered url <${input}> could not be found.`,
          );
          return;
        }
        showFile(fpath);
      }
    }),
  );
}

// function registerRouteDecorator(context: vscode.ExtensionContext) {
//   const documentSelector: vscode.DocumentSelector = [
//     { scheme: 'file', language: 'typescript' },
//     { scheme: 'file', language: 'typescriptreact' },
//     { scheme: 'file', language: 'javascript' },
//     { scheme: 'file', language: 'javascriptreact' },
//   ];
//   const pathParseManager = getPathParseManager();
//   context.subscriptions.push(
//     vscode.languages.registerHoverProvider(documentSelector, {
//       async provideHover(document, position) {
//         const range =
//           document.getWordRangeAtPosition(position, /"\/([^"]*)"/) ||
//           document.getWordRangeAtPosition(position, /`\/([^`]*)`/) ||
//           document.getWordRangeAtPosition(position, /'\/([^']*)'/);

//         if (range) {
//           const pathname = document.getText(range).slice(1, -1);
//           const fpath = pathParseManager.parse(pathname);
//           let markdown: vscode.MarkdownString;
//           if (fpath) {
//             markdown = PathCompletionItemManager.makeBasicMarkdown(fpath);
//             const jsDocManager = getJSDocManager();
//             const jsdoc = await jsDocManager.getJSDoc(fpath);
//             if (jsdoc) {
//               markdown.appendCodeblock(jsdoc, 'javascript');
//             }
//           } else {
//             markdown = new vscode.MarkdownString('No page matching this route was found');
//           }
//           return new vscode.Hover(markdown);
//         }
//       },
//     }),
//   );
// }

async function showFile(fpath: string) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fpath));
  vscode.window.showTextDocument(doc);
}

// async function setDecorationTest() {
//   const activeEditor = vscode.window.activeTextEditor;
//   const decorationType = vscode.window.createTextEditorDecorationType({
//     cursor: 'pointer',
//     textDecoration: 'underline',
//   });
//   if (activeEditor) {
//     activeEditor.setDecorations(decorationType, [
//       { range: new vscode.Range(0, 0, 1, 0), hoverMessage: '123' },
//     ]);
//   }
//   vscode.languages.registerDefinitionProvider([{ scheme: 'file', language: 'typescriptreact' }], {
//     provideDefinition(document, position) {
//       if (position.line === 0) {
//         return [
//           new vscode.Location(
//             vscode.Uri.file(
//               '/Users/admin/Desktop/work/MyStudy/project-vite-for-sagaroute-react/src/pages/user/e.tsx',
//             ),
//             new vscode.Range(0, 0, 0, 0),
//           ),
//         ];
//       }
//     },
//   });
// }

export let client: LanguageClient;

function initClient(context: vscode.ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };
  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'javascriptreact' },
    ],
  };

  client = new LanguageClient(
    'SagarouteLanguageServer',
    'Sagaroute Language Server',
    serverOptions,
    clientOptions,
  );

  client.start();
}

function stopClient() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

export function activate(context: vscode.ExtensionContext) {
  const settingConfiguration = vscode.workspace.getConfiguration('sagaroute');
  isEnabled = settingConfiguration.get('working') as boolean;
  try {
    initClient(context);
    initSendServerWithActiveTextEditor(context);
    initListenRouteDecoration(context);
    // setDecorationTest();
    initStatusBar(context);
    initParseUrlCommand(context);
    initListenWorkspaceConfiguration(context);
    initInputCommand(context);
    initConfigWatcher();
    initRoutingWatcher();
    // registerRouteCompletions(context);
    // registerRouteDecorator(context);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {
  configWatcher.dispose();
  routingWatcher.close();
  return stopClient();
}
