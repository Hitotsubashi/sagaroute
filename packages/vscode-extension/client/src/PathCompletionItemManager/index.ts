import { CompletionItem } from "vscode";
import * as vscode from "vscode";

const workspaceRootFolderPath =
  vscode.workspace.workspaceFolders![0].uri.fsPath;

function transformPathToSnippetLine(path: string) {
  let index = 1;
  return path.replace(/((\:[^\/]+)|(\*))/g, (arg1) => {
    return `\${${index++}:${arg1}}`;
  });
}

export class PathCompletionItemManager {
  completions: CompletionItem[] = [];

  static transformPathToCompletionItem(route: string, fpath?: string) {
    const completion = new vscode.CompletionItem(
      route,
      vscode.CompletionItemKind.Keyword
    );
    completion.insertText = new vscode.SnippetString(
      transformPathToSnippetLine(route)
    );
    if (fpath) {
      completion.documentation = new vscode.MarkdownString(
        `related to file: [${fpath.replace(
          workspaceRootFolderPath,
          ""
        )}](${fpath})`
      );
    }
    return completion;
  }

  setCompletions(completions: CompletionItem[]) {
    this.completions = completions;
  }

  getCompletions() {
    return this.completions;
  }
}

let pathCompletionItemManager: PathCompletionItemManager;

export default function getPathCompletionItemManager() {
  if (!pathCompletionItemManager) {
    pathCompletionItemManager = new PathCompletionItemManager();
  }
  return pathCompletionItemManager;
}
