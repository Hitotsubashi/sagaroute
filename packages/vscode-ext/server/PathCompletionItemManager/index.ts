// import path from 'path';
import getRouteFileRelationManager, { RouteFileRelationManager } from '../RouteFileRelationManager';
// import { workspaceRootFolderPath } from '..';
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver';

export class PathCompletionItemManager {
  private routeFileRelationManager: RouteFileRelationManager;
  private absoluteCompletions: CompletionItem[] = [];

  constructor(routeFileRelationManager: RouteFileRelationManager) {
    this.routeFileRelationManager = routeFileRelationManager;
  }

  private transformPathToSnippetLine(path: string) {
    let index = 1;
    return path.replace(/((:[^/]+)|(\*))/g, (arg1) => {
      return `\${${index++}:${arg1}}`;
    });
  }

  generateAbsoluteCompletions() {
    this.absoluteCompletions = this.generateCompletions();
  }

  private generateCompletions(baseroute?: string) {
    const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
    return Object.keys(routePathToFilePathMap)
      .filter((route) => {
        if (baseroute) {
          return route.startsWith(baseroute);
        } else {
          return true;
        }
      })
      .map((route) =>
        this.transformPathToCompletionItem(
          route.replace(baseroute || '/', ''),
          routePathToFilePathMap[route],
        ),
      );
  }

  getCompletions(baseroute?: string) {
    if (baseroute) {
      return this.generateCompletions(baseroute);
    } else {
      return this.absoluteCompletions;
    }
  }

  private transformPathToCompletionItem(route: string, filepath: string | undefined) {
    const completion = CompletionItem.create(route);
    completion.kind = CompletionItemKind.Text;
    completion.insertText = this.transformPathToSnippetLine(route);
    completion.insertTextFormat = InsertTextFormat.Snippet;
    completion.data = { filepath };
    return completion;
  }
}

let pathCompletionItemManager: PathCompletionItemManager;

export default function getPathCompletionItemManager() {
  if (!pathCompletionItemManager) {
    const routeFileRelationManager = getRouteFileRelationManager();
    pathCompletionItemManager = new PathCompletionItemManager(routeFileRelationManager);
  }
  return pathCompletionItemManager;
}
