import fs from 'fs';
import path from 'path';
import SagaRoute from '@/index';

test('test routing in normal', () => {
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
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
      '.tsx$': '',
    },
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
  const context = fs.readFileSync(outputFile, 'utf-8');
  expect(context).toMatchSnapshot();
  expect(buildHooksBefore.mock.calls).toHaveLength(1);
  expect(buildHooksBefore.mock.calls[0]).toStrictEqual([option]);
  expect(buildHooksAfter.mock.calls).toHaveLength(1);
  expect(buildHooksAfter.mock.calls[0]).toStrictEqual([
    {
      ...option,
      pathRewrite: [
        [new RegExp('^./'), '@/'],
        [new RegExp('.tsx$'), ''],
      ],
      relativeDirpath: path.join('..', 'pages'),
      relativeLayoutDirPath: path.join('..', 'layouts'),
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
          beforeEach: [weaveHooksBeforeEach],
          afterEach: [weaveHooksAfterEach],
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
    },
  ]);

  expect(gatherHooksBefore.mock.calls).toHaveLength(1);
  expect(gatherHooksBeforeEach.mock.calls).toHaveLength(3);
  expect(gatherHooksAfterEach.mock.calls).toHaveLength(3);
  expect(gatherHooksAfter.mock.calls).toHaveLength(1);

  expect(weaveHooksBefore.mock.calls).toHaveLength(1);
  expect(weaveHooksBeforeEach.mock.calls).toHaveLength(3);
  expect(weaveHooksAfterEach.mock.calls).toHaveLength(3);
  expect(weaveHooksAfter.mock.calls).toHaveLength(1);

  expect(printHooksParseBefore.mock.calls).toHaveLength(1);
  expect(printHooksParseAfter.mock.calls).toHaveLength(1);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(1);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(1);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(1);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(1);
});

test('test skip gather,weave and print', () => {
  const buildHooksBefore = jest.fn();
  const buildHooksAfter = jest.fn();
  const gatherHooksBefore = jest.fn(() => null);
  const gatherHooksAfter = jest.fn();
  const weaveHooksBefore = jest.fn();
  const weaveHooksAfter = jest.fn();
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
    },
    hooks: {
      build: {
        before: buildHooksBefore,
        after: buildHooksAfter,
      },
      gather: {
        before: gatherHooksBefore,
        after: gatherHooksAfter,
      },
      weave: {
        before: weaveHooksBefore,
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
  expect(gatherHooksAfter.mock.calls).toHaveLength(0);

  expect(weaveHooksBefore.mock.calls).toHaveLength(0);
  expect(weaveHooksAfter.mock.calls).toHaveLength(0);

  expect(printHooksParseBefore.mock.calls).toHaveLength(0);
  expect(printHooksParseAfter.mock.calls).toHaveLength(0);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(0);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});

test('test skip weave and print', () => {
  const buildHooksBefore = jest.fn();
  const buildHooksAfter = jest.fn();
  const gatherHooksBefore = jest.fn();
  const gatherHooksAfter = jest.fn();
  const weaveHooksBefore = jest.fn(() => null);
  const weaveHooksAfter = jest.fn();
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
    },
    hooks: {
      build: {
        before: buildHooksBefore,
        after: buildHooksAfter,
      },
      gather: {
        before: gatherHooksBefore,
        after: gatherHooksAfter,
      },
      weave: {
        before: weaveHooksBefore,
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
  expect(gatherHooksAfter.mock.calls).toHaveLength(1);

  expect(weaveHooksBefore.mock.calls).toHaveLength(1);
  expect(weaveHooksAfter.mock.calls).toHaveLength(0);

  expect(printHooksParseBefore.mock.calls).toHaveLength(0);
  expect(printHooksParseAfter.mock.calls).toHaveLength(0);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(0);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});

test('test skip print.parse', () => {
  const printHooksParseBefore = jest.fn(() => null);
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
    },
    hooks: {
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
  expect(printHooksParseBefore.mock.calls).toHaveLength(1);
  expect(printHooksParseAfter.mock.calls).toHaveLength(0);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(0);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});

test('test skip print.inject', () => {
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn(() => null);
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn();
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
    },
    hooks: {
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
  expect(printHooksParseBefore.mock.calls).toHaveLength(1);
  expect(printHooksParseAfter.mock.calls).toHaveLength(1);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(1);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(0);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(0);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});

test('test skip print.write', () => {
  const printHooksParseBefore = jest.fn();
  const printHooksParseAfter = jest.fn();
  const printHooksInjectBefore = jest.fn();
  const printHooksInjectAfter = jest.fn();
  const printHooksWriteBefore = jest.fn(() => null);
  const printHooksWriteAfter = jest.fn();
  const outputFile = path.join(__dirname, 'test-fixtures', 'normal-src', 'route.tsx');
  const option = {
    dirpath: path.join(__dirname, 'test-fixtures', 'normal-src/pages'),
    layoutDirPath: path.join(__dirname, 'test-fixtures', 'normal-src/layouts'),
    routeFilePath: outputFile,
    pathRewrite: {
      '^./': '@/',
    },
    hooks: {
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
  expect(printHooksParseBefore.mock.calls).toHaveLength(1);
  expect(printHooksParseAfter.mock.calls).toHaveLength(1);
  expect(printHooksInjectBefore.mock.calls).toHaveLength(1);
  expect(printHooksInjectAfter.mock.calls).toHaveLength(1);
  expect(printHooksWriteBefore.mock.calls).toHaveLength(1);
  expect(printHooksWriteAfter.mock.calls).toHaveLength(0);
});
