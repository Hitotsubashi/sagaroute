import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
import getPathCompletionItemManager from '../../PathCompletionItemManager';

const pathCompletionItemManager = getPathCompletionItemManager();

const statisticPathHooks: RoutingOption['hooks'] = {
  weave: {
    afterEach: {
      order: 105,
      handler(route, imports, fileNode) {
        pathCompletionItemManager.addRelation([route, fileNode]);
      },
    },
    after: {
      order: 105,
      handler(routes: RouteObject[]) {
        pathCompletionItemManager.setRoutes(routes);
      },
    },
  },
  print: {
    write: {
      before: {
        order: 110,
        handler() {
          pathCompletionItemManager.generateCompletions();
        },
      },
    },
  },
};

export default statisticPathHooks;
