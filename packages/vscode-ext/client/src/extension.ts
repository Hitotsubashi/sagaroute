import { FSWatcher } from 'chokidar';
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as path from 'path';
import debounce from 'lodash/debounce';
import getSagaRoute, { rebuildSagaroute } from './SagaRoute';
import getLogging from './Logging';
import { performance } from 'perf_hooks';
import getCacheManager from './CacheManager';
import getPathCompletionItemManager from './PathCompletionItemManager';
import getWarningManager from './WarningManager';

let isEnabled: boolean;
let routingWatcher: FSWatcher;
let configWatcher: FSWatcher;
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
  const sagaRouteConfigFiles = [
    path.join(workspaceRootFolderPath, 'sagaroute.config.js'),
    path.join(workspaceRootFolderPath, 'sagaroute.config.cjs'),
  ];
  configWatcher = chokidar
    .watch(sagaRouteConfigFiles, { ignoreInitial: true })
    .on('all', (event, filepath) => {
      const logging = getLogging();
      logging.logMessage(`[watch] File ${filepath} has been ${event}`);
      rebuildSagaroute();
      initRoutingWatcher(true);
    });
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
          default:
            break;
        }
        const logging = getLogging();
        logging.logMessage(`[watch] File ${filepath} has been ${event}`);
        debounceWorking();
      }
    });
}

function initLogging() {
  getLogging().show();
}

function registerRouteCompletions(context: vscode.ExtensionContext) {
  const documentSelector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'typescriptreact' },
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'javascriptreact' },
  ];
  const pathCompletionItemManager = getPathCompletionItemManager();

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      documentSelector,
      {
        provideCompletionItems(document, position, token) {
          const line = document.lineAt(position.line).text;
          if (line.slice(0, position.character).endsWith('//')) {
            const completions = pathCompletionItemManager.getCompletions();
            completions.forEach((item) => {
              item.additionalTextEdits = [
                vscode.TextEdit.replace(
                  new vscode.Range(
                    position.line,
                    position.character - 2,
                    position.line,
                    position.character,
                  ),
                  '',
                ),
              ];
            });
            return completions;
          }
          return undefined;
        },
      },
      '/',
    ),
  );
}

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

export function activate(context: vscode.ExtensionContext) {
  const settingConfiguration = vscode.workspace.getConfiguration('sagaroute');
  isEnabled = settingConfiguration.get('working') as boolean;
  try {
    initStatusBar(context);
    initLogging();
    initListenWorkspaceConfiguration(context);
    initInputCommand(context);
    initConfigWatcher();
    initRoutingWatcher();
    registerRouteCompletions(context);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {
  configWatcher.close();
  routingWatcher.close();
}
