import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
  buildHookAfterStdout,
  buildHookBeforeStdout,
  gatherHookAfterEachStdout,
  gatherHookAfterStdout,
  gatherHookBeforeEachStdout,
  gatherHookBeforeStdout,
  printHookAfterInjectStdout,
  printHookAfterParseStdout,
  printHookBeforeInjectStdout,
  printHookBeforeParseStdout,
  stdoutBadge,
  weaveHookAfterEachStdout,
  weaveHookAfterStdout,
  weaveHookBeforeEachStdout,
  weaveHookBeforeStdout,
} from './shout';
import stdoutManager from './stdoutManager';
import { blue, green, red, white, yellow } from 'colorette';
import SagaRoute from '@sagaroute/react';

export default function execute() {
  const argv = yargs(hideBin(process.argv)).argv;
  const startTime = performance.now();
  const warningMessages: string[] = [];
  stdoutManager.set({
    badge: stdoutBadge.info,
    message: blue('sagaroute is working...'),
  });
  try {
    const sagaRoute = new SagaRoute({
      ...argv,
      hooks: {
        build: {
          before: { order: -5, handler: buildHookBeforeStdout },
          after: { order: 105, handler: buildHookAfterStdout },
        },
        gather: {
          before: { order: -5, handler: gatherHookBeforeStdout },
          beforeEach: { order: -5, handler: gatherHookBeforeEachStdout },
          afterEach: { order: 105, handler: gatherHookAfterEachStdout },
          after: { order: 105, handler: gatherHookAfterStdout },
        },
        weave: {
          before: { order: -5, handler: weaveHookBeforeStdout },
          beforeEach: { order: -5, handler: weaveHookBeforeEachStdout },
          afterEach: { order: 105, handler: weaveHookAfterEachStdout },
          after: { order: 105, handler: weaveHookAfterStdout },
        },
        print: {
          parse: {
            before: { order: -5, handler: printHookBeforeParseStdout },
            after: { order: 105, handler: printHookAfterParseStdout },
          },
          inject: {
            before: { order: -5, handler: printHookBeforeInjectStdout },
            after: { order: 105, handler: printHookAfterInjectStdout },
          },
        },
      },
      onWarning: (message) => {
        warningMessages.push(message);
      },
    });
    sagaRoute.routing();
    const endTime = performance.now();
    const badge = warningMessages.length ? stdoutBadge.warn : stdoutBadge.done;
    const message = warningMessages.length
      ? yellow(
          `sagaroute has completed the work, but there are the following problems:\n${warningMessages
            .map((item, index) => white(`${index + 1}. ${item}`))
            .join('\n')}`,
        )
      : green(`sagaroute has finished successfully in ${Math.round(endTime - startTime)}ms`);
    stdoutManager.set({
      badge,
      message,
    });
  } catch (err: any) {
    stdoutManager.set(
      {
        badge: stdoutBadge.fail,
        message: red(err.message),
      },
      {},
    );
    throw err;
  }
}
