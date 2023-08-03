import BundledSagaRoute from '@sagaroute/react';
import SagaRoute, { RoutingOption } from '@sagaroute/react';
import * as vscode from 'vscode';
import mergeOption from '@sagaroute/react/lib/utils/mergeOption';
import loggingHooks from './hooks/logging';
import writingHooks from './hooks/writing';
import cloneDeep from 'lodash/cloneDeep';
import statisticPathHooks from './hooks/statistic-path';
import getWarningManager from '../WarningManager';
import getLogging from '../Logging';
import fs from 'fs';
import path from 'path';

const workspaceRootFolderPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

const mergedHooks = [loggingHooks, writingHooks, statisticPathHooks].reduce(
  (pre, cur) => mergeOption(pre, { hooks: cur }),
  {} as RoutingOption,
).hooks;

const sagaRouteConfig: RoutingOption = {
  rootPath: workspaceRootFolderPath,
  hooks: mergedHooks,
  onWarning(message) {
    const warningManager = getWarningManager();
    warningManager.addMessage(message);
  },
};

export function getSagaRouteConfig() {
  return cloneDeep(sagaRouteConfig);
}

let sagaRoute: SagaRoute;
const dependencyName = '@sagaroute/react';

function getSagarouteClass(): typeof BundledSagaRoute {
  const logging = getLogging();
  try {
    if (!vscode.workspace.isTrusted) {
      logging.logMessage('This workspace is not trusted. Using the bundled sagaroute.');
      return BundledSagaRoute;
    }
    const stats = fs.statSync(path.join(workspaceRootFolderPath, 'package.json'));
    if (stats?.isFile()) {
      const packageJSON = require(path.join(workspaceRootFolderPath, 'package.json'));
      const version =
        packageJSON.devDependencies?.[dependencyName] || packageJSON.dependencies?.[dependencyName];
      if (version) {
        const localSagaroutePath = path.join(
          workspaceRootFolderPath,
          'node_modules',
          dependencyName,
        );
        if (fs.statSync(localSagaroutePath)) {
          logging.logMessage(`Using the local sagaroute:${version}.`);
          return require(localSagaroutePath).default;
        } else {
          logging.logMessage(
            `The file [package.json] has "${dependencyName}" in dependency but not found in node_modules. Using the bundled sagaroute.`,
          );
          return BundledSagaRoute;
        }
      } else {
        logging.logMessage(
          `The file [package.json] doesn't has "${dependencyName}" in either dependency or devDependency. Using the bundled sagaroute.`,
        );
        return BundledSagaRoute;
      }
    } else {
      logging.logMessage('The file [package.json] is not exist. Using the bundled sagaroute.');
      return BundledSagaRoute;
    }
  } catch (err) {
    logging.logMessage(`ERROR: ${err}. Using the bundled sagaroute.`, 'ERROR');
    return BundledSagaRoute;
  }
}

export default function getSagaRoute() {
  if (!sagaRoute) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const SagaRoute = getSagarouteClass();
    sagaRoute = new SagaRoute(getSagaRouteConfig());
  }
  return sagaRoute;
}
