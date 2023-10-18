import { FileNode } from '@sagaroute/react/lib/gather';
import { RouteObject } from '@sagaroute/react/lib/weave';
import path from 'path';
export type ModifedRouteObject = RouteObject & { fileNode: FileNode };

export class RouteFileRelationManager {
  private routes: ModifedRouteObject[] = [];
  private routeObjectToFilePathMap = new Map<ModifedRouteObject, string>();
  private routePathToFilePathMap: Record<string, string | undefined> = {};
  private filePathToRoutePathMap: Record<string, string> = {};
  private routePathToRouteObjectMap: Record<string, ModifedRouteObject> = {};

  getRouteObjectToFilePathMap() {
    return this.routeObjectToFilePathMap;
  }

  getRoutePathToFilePathMap() {
    return this.routePathToFilePathMap;
  }

  getFilePathToRoutePathMap() {
    return this.filePathToRoutePathMap;
  }

  getRoutePathToRouteObjectMap() {
    return this.routePathToRouteObjectMap;
  }

  setRoutes(routes: ModifedRouteObject[]) {
    this.routes = routes;
  }

  // make single reflect between routeObject and FileNode.path in routeObjectToFilePathMap
  private buildRouteMap(route: ModifedRouteObject) {
    const { fileNode } = route;
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

    if (route.children?.length) {
      route.children.forEach((item) => {
        this.buildRouteMap(item as ModifedRouteObject);
      });
    }
  }

  // make routePathToFilePathMap and filePathToRoutePathMap,connect both routeObject.path and FileNode.path
  private buildRoutePathMap(route: ModifedRouteObject, parentPath = '') {
    let routePath = route.path ? `${parentPath}/${route.path}` : parentPath;
    if (!routePath.startsWith('/')) {
      routePath = '/' + routePath;
    }
    routePath = routePath.replace(/^\/\//, '/');
    this.routePathToRouteObjectMap[routePath] = route;
    const routeAvaliable =
      route.path &&
      (route.element ||
        route.Component ||
        route.lazy ||
        route.children?.some(({ index }) => index === true));

    if (routeAvaliable) {
      const filePath = this.routeObjectToFilePathMap.get(route);
      this.routePathToFilePathMap[routePath] = filePath;
      if (filePath) {
        this.filePathToRoutePathMap[filePath] = routePath;
      }
    }

    if (route.children?.length) {
      route.children.forEach((item) => {
        this.buildRoutePathMap(item as ModifedRouteObject, routePath);
      });
    }
  }

  // build Map
  buildMap() {
    this.routeObjectToFilePathMap.clear();
    this.routePathToFilePathMap = {};
    this.filePathToRoutePathMap = {};
    this.routePathToRouteObjectMap = {};
    this.routes.forEach((route) => {
      this.buildRouteMap(route);
    });
    this.routes.forEach((route) => {
      this.buildRoutePathMap(route);
    });
  }
}

let routeFileRelationManager: RouteFileRelationManager;
export default function getRouteFileRelationManager() {
  if (!routeFileRelationManager) {
    routeFileRelationManager = new RouteFileRelationManager();
  }
  return routeFileRelationManager;
}
