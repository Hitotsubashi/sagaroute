import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
// import getRouteFileRelationManager from '../../RouteFileRelationManager';
// import getPathCompletionItemManager from '../../PathCompletionItemManager';
// import getPathParseManager from '../../PathParseManager';
import { FileNode } from '@sagaroute/react/lib/gather';
import { client } from '../../extension';

// const routeFileRelationManager = getRouteFileRelationManager();
// const pathCompletionItemManager = getPathCompletionItemManager();
// const pathParseManager = getPathParseManager();

type ModifedRouteObject = RouteObject & { fileNode?: FileNode };

const relations: WeakMap<RouteObject, FileNode> = new WeakMap();
let routesWithFileNode: ModifedRouteObject[] = [];

const statisticPathHooks: RoutingOption['hooks'] = {
  weave: {
    afterEach: {
      order: 105,
      handler(route, imports, fileNode) {
        // routeFileRelationManager.addRelation([route, fileNode]);
        // relations.push([route, fileNode]);
        relations.set(route, fileNode);
      },
    },
    after: {
      order: 105,
      handler(routes: RouteObject[]) {
        // routeFileRelationManager.setRoutes(routes);
        // client.sendNotification('routeFileRelationManager/buildMap', {
        //   relations: relations.slice(),
        //   routes,
        // });
        // relations.length = 0;
        routesWithFileNode = routes;
      },
    },
  },
  print: {
    write: {
      before: {
        order: 110,
        handler() {
          // routeFileRelationManager.buildMap();
          // pathCompletionItemManager.generateCompletions();
          // pathParseManager.compute();
          traverseRouteAndMountFileNode(routesWithFileNode);
          client.sendNotification('routeFileRelationManager/buildMap', {
            routes: routesWithFileNode,
          });
          routesWithFileNode = [];
        },
      },
    },
  },
};

function traverseRouteAndMountFileNode(routes: ModifedRouteObject[]) {
  routes.forEach((route) => {
    route.fileNode = relations.get(route);
    if (Array.isArray(route.children)) {
      traverseRouteAndMountFileNode(route.children);
    }
  });
}

export default statisticPathHooks;
