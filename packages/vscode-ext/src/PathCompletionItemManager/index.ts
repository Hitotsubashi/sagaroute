import { CompletionItem } from 'vscode';
import * as vscode from 'vscode';
import path from 'path';
import getRouteFileRelationManager, { RouteFileRelationManager } from '../RouteFileRelationManager';

const workspaceRootFolderPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

function transformPathToSnippetLine(path: string) {
  let index = 1;
  return path.replace(/((:[^/]+)|(\*))/g, (arg1) => {
    return `\${${index++}:${arg1}}`;
  });
}

const baseUri = vscode.Uri.file(path.join(workspaceRootFolderPath, 'package.json'));
export class PathCompletionItemManager {
  private routeFileRelationManager: RouteFileRelationManager;
  private completions: CompletionItem[] = [];

  constructor(routeFileRelationManager: RouteFileRelationManager) {
    this.routeFileRelationManager = routeFileRelationManager;
  }

  static makeBasicMarkdown(fpath: string) {
    const relatedFileText = fpath.replace(workspaceRootFolderPath, '').replaceAll(path.sep, '/');
    const relatedFileLink = fpath.replace(workspaceRootFolderPath, '.').replaceAll(path.sep, '/');
    const md = new vscode.MarkdownString(
      `related to file: [${relatedFileText}](${relatedFileLink})`,
    );
    md.baseUri = baseUri;
    return md;
  }

  generateCompletions() {
    const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
    this.completions = Object.keys(routePathToFilePathMap).map((route) =>
      this.transformPathToCompletionItem(route),
    );
  }

  getCompletions() {
    this.assignCompletionsWithDocumentaion();
    return this.completions;
  }

  private transformPathToCompletionItem(route: string) {
    const completion = new vscode.CompletionItem(route, vscode.CompletionItemKind.Function);
    completion.insertText = new vscode.SnippetString(transformPathToSnippetLine(route));
    return completion;
  }

  private assignCompletionsWithDocumentaion() {
    const routePathToFilePathMap = this.routeFileRelationManager.getRoutePathToFilePathMap();
    this.completions.forEach((completion) => {
      const fpath = routePathToFilePathMap[completion.label as string];
      if (fpath) {
        completion.documentation = PathCompletionItemManager.makeBasicMarkdown(fpath);
      }
    });
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
