import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
import getPathCompletionItemManager, {
  PathCompletionItemManager,
} from '../../PathCompletionItemManager';
import path from 'path';

let paths: { route: string; fpath?: string }[] = [];
const pathCompletionItemManager = getPathCompletionItemManager();
const routeToFilePathMap = new Map<RouteObject, string>();

function traverseRoute(route: RouteObject, parentPath = '') {
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
    paths.push({ route: routePath, fpath: routeToFilePathMap.get(route) });
  }

  if (route.children?.length) {
    route.children.forEach((item) => {
      traverseRoute(item, routePath);
    });
  }
}

const statisticPathHooks: RoutingOption['hooks'] = {
  weave: {
    afterEach: {
      order: 105,
      handler(route, imports, fileNode) {
        process.nextTick(() => {
          if (fileNode.type === 'dir') {
            const layoutFileNode = fileNode.children?.find(
              ({ name }) => path.parse(name).name === '_layout',
            );
            if (layoutFileNode) {
              routeToFilePathMap.set(route, layoutFileNode.path);
            } else {
              const indexFileNode = fileNode.children?.find(
                ({ props, name }) =>
                  props?.routeProps?.index === true ||
                  (path.parse(name).name === 'index' && props?.routeProps?.index !== false),
              );
              if (indexFileNode) {
                routeToFilePathMap.set(route, indexFileNode.path);
              }
            }
          } else {
            routeToFilePathMap.set(route, fileNode.path);
          }
        });
      },
    },
    after: {
      order: 105,
      handler(routes: RouteObject[]) {
        // 放到宏任务里执行，避免阻塞生成路由列表
        process.nextTick(() => {
          paths = [];
          routes.forEach((route) => {
            traverseRoute(route);
          });
          pathCompletionItemManager.setCompletions(
            paths.map((item) =>
              PathCompletionItemManager.transformPathToCompletionItem(item.route, item.fpath),
            ),
          );
          routeToFilePathMap.clear();
        });
      },
    },
  },
};

export default statisticPathHooks;
