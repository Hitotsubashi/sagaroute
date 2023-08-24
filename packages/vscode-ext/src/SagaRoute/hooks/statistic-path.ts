import { RoutingOption } from '@sagaroute/react';
import { RouteObject } from '@sagaroute/react/lib/weave';
import getPathCompletionItemManager from '../../PathCompletionItemManager';

const pathCompletionItemManager = getPathCompletionItemManager();

const statisticPathHooks: RoutingOption['hooks'] = {
  weave: {
    afterEach: {
      order: 105,
      handler(route, imports, fileNode) {
        process.nextTick(() => {
          pathCompletionItemManager.establishMapWithRouteAndFilePath(route, fileNode);
        });
      },
    },
    after: {
      order: 105,
      handler(routes: RouteObject[]) {
        // 放到宏任务里执行，避免阻塞生成路由列表
        process.nextTick(() => {
          pathCompletionItemManager.generateCompletions(routes);
        });
      },
    },
  },
};

export default statisticPathHooks;
