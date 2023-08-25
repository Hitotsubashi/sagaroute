import { FileNode } from '@sagaroute/react/lib/gather';
import { RouteObject } from '@sagaroute/react/lib/weave';
import { CompletionItem } from 'vscode';
import * as vscode from 'vscode';
import path from 'path';

const workspaceRootFolderPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

function transformPathToSnippetLine(path: string) {
  let index = 1;
  return path.replace(/((:[^/]+)|(\*))/g, (arg1) => {
    return `\${${index++}:${arg1}}`;
  });
}

export class PathCompletionItemManager {
  private routeAndFileNodeRelations: [RouteObject, FileNode][] = [];
  private routes: RouteObject[] = [];
  private completions: CompletionItem[] = [];
  private routeToFilePathMap = new Map<RouteObject, string>();
  private routePathToFilePathMap: Record<string, string | undefined> = {};
  private baseUri = vscode.Uri.file(path.join(workspaceRootFolderPath, 'package.json'));

  setRoutes(routes: RouteObject[]) {
    this.routes = routes;
  }

  addRelation(relation: PathCompletionItemManager['routeAndFileNodeRelations'][0]) {
    this.routeAndFileNodeRelations.push(relation);
  }

  findFpath(route: string) {
    return this.routePathToFilePathMap[route];
  }

  generateCompletions() {
    this.routeAndFileNodeRelations.forEach(([route, fileNode]) => {
      this.establishMapWithRouteAndFilePath(route, fileNode);
    });
    this.routeAndFileNodeRelations = [];
    this.routePathToFilePathMap = {};
    this.routes.forEach((route) => {
      this.traverseRoute(route);
    });
    this.completions = Object.keys(this.routePathToFilePathMap).map((route) =>
      this.transformPathToCompletionItem(route),
    );
    this.routeToFilePathMap.clear();
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
    this.completions.forEach((completion) => {
      const fpath = this.routePathToFilePathMap[completion.label as string];
      if (fpath) {
        const md = new vscode.MarkdownString(
          `related to file: [${fpath.replace(workspaceRootFolderPath, '')}](${fpath
            .replace(workspaceRootFolderPath, '.')
            .replaceAll(path.sep, '/')})`,
        );
        md.baseUri = this.baseUri;
        completion.documentation = md;
      }
    });
  }

  private establishMapWithRouteAndFilePath(route: RouteObject, fileNode: FileNode) {
    if (fileNode.type === 'dir') {
      const layoutFileNode = fileNode.children?.find(
        ({ name }) => path.parse(name).name === '_layout',
      );
      if (layoutFileNode) {
        this.routeToFilePathMap.set(route, layoutFileNode.path);
      } else {
        const indexFileNode = fileNode.children?.find(
          ({ props, name }) =>
            props?.routeProps?.index === true ||
            (path.parse(name).name === 'index' && props?.routeProps?.index !== false),
        );
        if (indexFileNode) {
          this.routeToFilePathMap.set(route, indexFileNode.path);
        }
      }
    } else {
      this.routeToFilePathMap.set(route, fileNode.path);
    }
  }

  private traverseRoute(route: RouteObject, parentPath = '') {
    let routePath = route.path ? `${parentPath}/${route.path}` : parentPath;
    if (!routePath.startsWith('/')) {
      routePath = '/' + routePath;
    }
    routePath = routePath.replace(/^\/\//, '/');
    const routeAvaliable =
      route.path &&
      (route.element ||
        route.Component ||
        route.lazy ||
        route.children?.some(({ index }) => index === true));

    if (routeAvaliable) {
      this.routePathToFilePathMap[routePath] = this.routeToFilePathMap.get(route);
    }

    if (route.children?.length) {
      route.children.forEach((item) => {
        this.traverseRoute(item, routePath);
      });
    }
  }
}

let pathCompletionItemManager: PathCompletionItemManager;

export default function getPathCompletionItemManager() {
  if (!pathCompletionItemManager) {
    pathCompletionItemManager = new PathCompletionItemManager();
  }
  return pathCompletionItemManager;
}
