import path from 'path';
import SagaRoute from '@/index';

test('test routing that only gather.', () => {
  const buildHooksBefore = jest.fn();
  const buildHooksAfter = jest.fn();
  const gatherHooksBefore = jest.fn();
  const gatherHooksBeforeEach = jest.fn();
  const gatherHooksAfterEach = jest.fn();
  const gatherHooksAfter = jest.fn();
  const weaveHooksBefore = jest.fn(() => null);
  const weaveHooksBeforeEach = jest.fn();
  const weaveHooksAfterEach = jest.fn();
  const weaveHooksAfter = jest.fn();
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const option = {
    rootPath: __dirname,
    layoutDirPath: path.join('src/views'),
    hooks: {
      build: {
        before: buildHooksBefore,
        after: buildHooksAfter,
      },
      gather: {
        before: gatherHooksBefore,
        beforeEach: gatherHooksBeforeEach,
        afterEach: gatherHooksAfterEach,
        after: gatherHooksAfter,
      },
      weave: {
        before: weaveHooksBefore,
        beforeEach: weaveHooksBeforeEach,
        afterEach: weaveHooksAfterEach,
        after: weaveHooksAfter,
      },
      print: {
        parse: {
          before: printHooksParseBefore,
          after: printHooksParseAfter,
        },
        inject: {
          before: printHooksInjectBefore,
          after: printHooksInjectAfter,
        },
        write: {
          before: printHooksWriteBefore,
          after: printHooksWriteAfter,
        },
      },
    },
  };
  const sagaRoute = new SagaRoute(option);
  sagaRoute.routing();

  expect(buildHooksBefore.mock.calls).toHaveLength(1);
  expect(buildHooksAfter.mock.calls).toHaveLength(1);

  expect(gatherHooksBefore.mock.calls).toHaveLength(1);
  expect(gatherHooksBeforeEach.mock.calls).toHaveLength(2);
  expect(gatherHooksAfterEach.mock.calls).toHaveLength(2);
  expect(gatherHooksAfter.mock.calls).toHaveLength(1);

  expect(weaveHooksBefore.mock.calls).toHaveLength(1);
  expect(weaveHooksBeforeEach.mock.calls).toHaveLength(0);
  expect(weaveHooksAfterEach.mock.calls).toHaveLength(0);
  expect(weaveHooksAfter.mock.calls).toHaveLength(0);

  expect(printHooksParseBefore.mock.calls).toHaveLength(0);
  expect(printHooksParseAfter.mock.calls).toHaveLength(0);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(0);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});

test('test routing that only gather and weave.', () => {
  const buildHooksBefore = jest.fn();
  const buildHooksAfter = jest.fn();
  const gatherHooksBefore = jest.fn();
  const gatherHooksBeforeEach = jest.fn();
  const gatherHooksAfterEach = jest.fn();
  const gatherHooksAfter = jest.fn();
  const weaveHooksBefore = jest.fn();
  const weaveHooksBeforeEach = jest.fn();
  const weaveHooksAfterEach = jest.fn();
  const weaveHooksAfter = jest.fn();
  const printHooksParseBefore = jest.fn(() => null);
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();

  const option = {
    rootPath: __dirname,
    layoutDirPath: path.join('src', 'views'),
    hooks: {
      build: {
        before: [buildHooksBefore],
        after: [buildHooksAfter],
      },
      gather: {
        before: [gatherHooksBefore],
        beforeEach: [gatherHooksBeforeEach],
        afterEach: [gatherHooksAfterEach],
        after: [gatherHooksAfter],
      },
      weave: {
        before: [weaveHooksBefore],
        beforeEach: [{ order: 1, handler: weaveHooksBeforeEach }],
        afterEach: { order: 1, handler: weaveHooksAfterEach },
        after: [weaveHooksAfter],
      },
      print: {
        parse: {
          before: [printHooksParseBefore],
          after: [printHooksParseAfter],
        },
        inject: {
          before: [printHooksInjectBefore],
          after: [printHooksInjectAfter],
        },
        write: {
          before: [printHooksWriteBefore],
          after: [printHooksWriteAfter],
        },
      },
    },
  };
  const sagaRoute = new SagaRoute(option);
  sagaRoute.routing();
  expect(buildHooksBefore.mock.calls).toHaveLength(1);
  expect(buildHooksAfter.mock.calls).toHaveLength(1);

  expect(gatherHooksBefore.mock.calls).toHaveLength(1);
  expect(gatherHooksBeforeEach.mock.calls).toHaveLength(2);
  expect(gatherHooksAfterEach.mock.calls).toHaveLength(2);
  expect(gatherHooksAfter.mock.calls).toHaveLength(1);

  expect(weaveHooksBefore.mock.calls).toHaveLength(1);
  expect(weaveHooksBeforeEach.mock.calls).toHaveLength(2);
  expect(weaveHooksAfterEach.mock.calls).toHaveLength(2);
  expect(weaveHooksAfter.mock.calls).toHaveLength(1);

  expect(printHooksParseBefore.mock.calls).toHaveLength(1);
  expect(printHooksParseAfter.mock.calls).toHaveLength(0);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(0);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});
