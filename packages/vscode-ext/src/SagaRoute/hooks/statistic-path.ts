import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
import getRouteFileRelationManager from '../../RouteFileRelationManager';
import getPathCompletionItemManager from '../../PathCompletionItemManager';

const routeFileRelationManager = getRouteFileRelationManager();
const pathCompletionItemManager = getPathCompletionItemManager();

const statisticPathHooks: RoutingOption['hooks'] = {
  weave: {
    afterEach: {
      order: 105,
      handler(route, imports, fileNode) {
        routeFileRelationManager.addRelation([route, fileNode]);
      },
    },
    after: {
      order: 105,
      handler(routes: RouteObject[]) {
        routeFileRelationManager.setRoutes(routes);
      },
    },
  },
  print: {
    write: {
      before: {
        order: 110,
        handler() {
          routeFileRelationManager.buildMap();
          pathCompletionItemManager.generateCompletions();
        },
      },
    },
  },
};

export default statisticPathHooks;
