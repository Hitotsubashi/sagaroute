import { RoutingOption } from '@sagaroute/react';
import getLogging from '../../Logging';

const logging = getLogging();

const loggingHooks: RoutingOption['hooks'] = {
  build: {
    before: {
      order: -10,
      handler() {
        logging.logMessage('[build:start]');
      },
    },
    after: {
      order: 110,
      handler(ultimateOption) {
        logging.logMessage('[build:end]');
        logging.logObject(ultimateOption);
      },
    },
  },
  gather: {
    before: {
      order: -10,
      handler(dirpath, layoutDirPath) {
        logging.logMessage(`[gather:before]  dirpath: ${dirpath}, layoutDirPath: ${layoutDirPath}`);
      },
    },
    // beforeEach: {
    //   order: -10,
    //   handler(fileNodePath) {
    //     logging.logMessage(
    //       `[gather:beforeEach]  fileNodePath: ${fileNodePath}`
    //     );
    //   },
    // },
    afterEach: {
      order: 110,
      handler(fileNode, fileNodePath) {
        logging.logMessage(`[gather:afterEach] gathering fileNodePath: ${fileNodePath}`);
      },
    },
    after: {
      order: 110,
      handler() {
        logging.logMessage(`[gather:after]`);
      },
    },
  },
  weave: {
    before: {
      order: -10,
      handler() {
        logging.logMessage(`[weave:before]`);
      },
    },
    beforeEach: {
      order: -10,
      handler(fileNode, parent) {
        logging.logMessage(
          `[weave:beforeEach]  fileNode.name: ${fileNode.name}, parent.path: ${parent.path}`,
        );
      },
    },
    afterEach: {
      order: 110,
      handler(route, imports, fileNode, parent) {
        logging.logMessage(
          `[weave:afterEach]  fileNode.name: ${fileNode.name}, parent.path: ${parent.path}`,
        );
      },
    },
    after: {
      order: 110,
      handler() {
        logging.logMessage(`[weave:after]`);
      },
    },
  },
  print: {
    parse: {
      before: {
        order: 1,
        handler(routeFilePath) {
          logging.logMessage(`[print:parse:before]  routeFilePath: ${routeFilePath}`);
        },
      },
      after: {
        order: 110,
        handler(template, routeFilePath) {
          logging.logMessage(`[print:parse:after]  routeFilePath: ${routeFilePath}`);
        },
      },
    },
    inject: {
      before: {
        order: -10,
        handler() {
          logging.logMessage(`[print:inject:before]`);
        },
      },
      after: {
        order: 110,
        handler() {
          logging.logMessage(`[print:inject:after]`);
        },
      },
    },
    write: {
      before: {
        order: -10,
        handler(renderedContent: string, routeFilePath: string) {
          logging.logMessage(`[print:write:before]  routeFilePath: ${routeFilePath}`);
        },
      },

      after: {
        order: 110,
        handler(routeFilePath: string) {
          logging.logMessage(`[print:write:after]  routeFilePath: ${routeFilePath}`);
        },
      },
    },
  },
};

export default loggingHooks;
