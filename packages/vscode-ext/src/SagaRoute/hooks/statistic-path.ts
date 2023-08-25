import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
import getRouteFileRelationManager from '../../RouteFileRelationManager';
import getPathCompletionItemManager from '../../PathCompletionItemManager';
import getPathParseManager from '../../PathParseManager';

const routeFileRelationManager = getRouteFileRelationManager();
const pathCompletionItemManager = getPathCompletionItemManager();
const pathParseManager = getPathParseManager();

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
          pathParseManager.compute();
        },
      },
    },
  },
};

export default statisticPathHooks;
