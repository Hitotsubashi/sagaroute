import { RoutingOption } from '@sagaroute/react';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import getCacheManager from '../../CacheManager';
import isEqual from 'lodash/isEqual';
import getLogging from '../../Logging';

let hasChange = false;
const cacheManager = getCacheManager();
const logging = getLogging();

const writingHooks: RoutingOption['hooks'] = {
  gather: {
    beforeEach: {
      order: -5,
      handler(fileNodePath) {
        if (!cacheManager.hasDirty(fileNodePath) && cacheManager.hasCache(fileNodePath)) {
          logging.logMessage(`[gather:beforeEach] matching cache fileNodePath: ${fileNodePath}`);
          return cacheManager.getCache(fileNodePath);
        }
      },
    },
    afterEach: {
      order: 105,
      handler(fileNode, fileNodePath) {
        if (fileNode.type === 'file') {
          cacheManager.curCount++;
          if (cacheManager.hasCache(fileNodePath)) {
            const oldFileNode = cacheManager.getCache(fileNodePath);
            if (!isEqual(oldFileNode, fileNode)) {
              hasChange = true;
            }
          } else {
            hasChange = true;
          }
          cacheManager.setCache(fileNodePath, fileNode);
        }
      },
    },
    after: {
      order: 105,
      handler() {
        if (!hasChange && cacheManager.compareCount()) {
          logging.logMessage(`[gather:after] nothing change.`);
        } else {
          hasChange = true;
        }
        cacheManager.clearDirty();
        cacheManager.refreshCount();
      },
    },
  },
  weave: {
    before: {
      order: -5,
      handler() {
        if (!hasChange) {
          return null;
        }
      },
    },
  },
  print: {
    write: {
      before: {
        order: -5,
        handler(renderedContent: string, routeFilePath: string) {
          hasChange = false;
          const routerFilePath = Uri.file(routeFilePath);
          vscode.workspace.openTextDocument(routerFilePath).then((document) => {
            const lastline = document.lineAt(document.lineCount - 1);
            const deleteEdit = vscode.TextEdit.delete(
              new vscode.Range(0, 0, lastline.range.end.line, lastline.range.end.character),
            );
            const textEdit = vscode.TextEdit.replace(new vscode.Range(0, 0, 0, 0), renderedContent);
            const workspaceRouterEdit = new vscode.WorkspaceEdit();
            workspaceRouterEdit.set(routerFilePath, [deleteEdit, textEdit]);
            vscode.workspace.applyEdit(workspaceRouterEdit).then(() => {
              document.save();
            });
          });

          return null;
        },
      },
    },
  },
};

export default writingHooks;
