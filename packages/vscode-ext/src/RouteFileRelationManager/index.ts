import { FileNode } from '@sagaroute/react/lib/gather';
import { RouteObject } from '@sagaroute/react/lib/weave';
import path from 'path';

export class RouteFileRelationManager {
  private relations: [RouteObject, FileNode][] = [];
  private routes: RouteObject[] = [];
  private routeObjectToFilePathMap = new Map<RouteObject, string>();
  private routePathToFilePathMap: Record<string, string | undefined> = {};

  getRouteObjectToFilePathMap() {
    return this.routeObjectToFilePathMap;
  }

  getRoutePathToFilePathMap() {
    return this.routePathToFilePathMap;
  }

  addRelation(relation: RouteFileRelationManager['relations'][0]) {
    this.relations.push(relation);
  }

  clearRelations() {
    this.relations = [];
  }

  setRoutes(routes: RouteObject[]) {
    this.routes = routes;
  }

  // make single reflect between routeObject and FileNode.path in routeObjectToFilePathMap
  private establishMapWithRouteAndFilePath(route: RouteObject, fileNode: FileNode) {
    if (fileNode.type === 'dir') {
      const layoutFileNode = fileNode.children?.find(
        ({ name }) => path.parse(name).name === '_layout',
      );
      if (layoutFileNode) {
        this.routeObjectToFilePathMap.set(route, layoutFileNode.path);
      } else {
        const indexFileNode = fileNode.children?.find(
          ({ props, name }) =>
            props?.routeProps?.index === true ||
            (path.parse(name).name === 'index' && props?.routeProps?.index !== false),
        );
        if (indexFileNode) {
          this.routeObjectToFilePathMap.set(route, indexFileNode.path);
        }
      }
    } else {
      this.routeObjectToFilePathMap.set(route, fileNode.path);
    }
  }

  // make routePathToFilePathMap,connect both routeObject.path and FileNode.path
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
      this.routePathToFilePathMap[routePath] = this.routeObjectToFilePathMap.get(route);
    }

    if (route.children?.length) {
      route.children.forEach((item) => {
        this.traverseRoute(item, routePath);
      });
    }
  }

  // build Map
  buildMap() {
    this.routeObjectToFilePathMap.clear();
    this.routePathToFilePathMap = {};
    this.relations.forEach(([route, fileNode]) => {
      this.establishMapWithRouteAndFilePath(route, fileNode);
    });
    this.routes.forEach((route) => {
      this.traverseRoute(route);
    });
    this.relations = [];
  }
}

let routeFileRelationManager: RouteFileRelationManager;
export default function getRouteFileRelationManager() {
  if (!routeFileRelationManager) {
    routeFileRelationManager = new RouteFileRelationManager();
  }
  return routeFileRelationManager;
}
