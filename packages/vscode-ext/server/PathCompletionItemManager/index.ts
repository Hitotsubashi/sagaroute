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
    return path
      .replace(/((:[^/]+)|(\*))/g, (arg1) => {
        return `\${${index++}:${arg1}}`;
      })
      .slice(1);
  }

  generateAbsoluteCompletions() {
    const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
    this.absoluteCompletions = Object.keys(routePathToFilePathMap).map((route) =>
      this.transformPathToCompletionItem(route),
    );
  }

  getCompletions(baseroute?: string) {
    return this.absoluteCompletions;
  }

  private transformPathToCompletionItem(route: string) {
    const completion = CompletionItem.create(route);
    completion.kind = CompletionItemKind.Text;
    completion.insertText = this.transformPathToSnippetLine(route);
    completion.insertTextFormat = InsertTextFormat.Snippet;
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
