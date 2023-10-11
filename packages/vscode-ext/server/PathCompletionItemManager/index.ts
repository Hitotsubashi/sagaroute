// import path from 'path';
import getRouteFileRelationManager, { RouteFileRelationManager } from '../RouteFileRelationManager';
// import { workspaceRootFolderPath } from '..';
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver';

export class PathCompletionItemManager {
  private routeFileRelationManager: RouteFileRelationManager;
  private completions: CompletionItem[] = [];

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

  // static makeBasicMarkdown(fpath: string) {
  //   const relatedFileText = fpath.replace(workspaceRootFolderPath, '').replaceAll(path.sep, '/');
  //   const relatedFileLink = fpath.replace(workspaceRootFolderPath, '.').replaceAll(path.sep, '/');
  //   const md = new vscode.MarkdownString(
  //     `related to file: [${relatedFileText}](${relatedFileLink})`,
  //   );
  //   return md;
  // }

  generateCompletions() {
    const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
    this.completions = Object.keys(routePathToFilePathMap).map((route) =>
      this.transformPathToCompletionItem(route),
    );
  }

  getCompletions() {
    // this.assignCompletionsWithDocumentaion();
    return this.completions;
  }

  private transformPathToCompletionItem(route: string) {
    const completion = CompletionItem.create(route);
    completion.kind = CompletionItemKind.Text;
    completion.insertText = this.transformPathToSnippetLine(route);
    completion.insertTextFormat = InsertTextFormat.Snippet;
    return completion;
  }

  // private assignCompletionsWithDocumentaion() {
  //   const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
  //   this.completions.forEach((completion) => {
  //     const fpath = routePathToFilePathMap[completion.label as string];
  //     if (fpath) {
  //       completion.documentation = PathCompletionItemManager.makeBasicMarkdown(fpath);
  //     }
  //   });
  // }
}

let pathCompletionItemManager: PathCompletionItemManager;

export default function getPathCompletionItemManager() {
  if (!pathCompletionItemManager) {
    const routeFileRelationManager = getRouteFileRelationManager();
    pathCompletionItemManager = new PathCompletionItemManager(routeFileRelationManager);
  }
  return pathCompletionItemManager;
}
