import mergeOption from '@/utils/mergeOption';

test('test mergeOption with basic config', () => {
  expect(
    mergeOption(
      {
        dirpath: 'input',
        layoutDirPath: 'input',
        routeFilePath: 'input',
        lazy: true,
        pathRewrite: {
          input: 'input',
        },
      },
      {
        dirpath: 'config',
        layoutDirPath: 'config',
        routeFilePath: 'config',
        lazy: false,
        pathRewrite: {
          config: 'config',
        },
      },
    ),
  ).toStrictEqual({
    dirpath: 'input',
    layoutDirPath: 'input',
    routeFilePath: 'input',
    lazy: true,
    pathRewrite: {
      input: 'input',
    },
  });
});

test('test mergeOption with both config wich some options of input are undefined', () => {
  expect(
    mergeOption(
      {
        dirpath: 'input',
      },
      {
        dirpath: 'config',
        layoutDirPath: 'config',
        routeFilePath: 'config',
        lazy: false,
        pathRewrite: {
          config: 'config',
        },
      },
    ),
  ).toStrictEqual({
    dirpath: 'input',
    layoutDirPath: 'config',
    routeFilePath: 'config',
    lazy: false,
    pathRewrite: {
      config: 'config',
    },
  });
});

/**
 * type:
 * []
 * fn
 * undefined
 */
test('test mergeOption with multiple hook', () => {
  const hook1 = () => {};
  const hook2 = () => {};
  expect(
    mergeOption(
      {
        hooks: {
          gather: {
            before: [hook1],
            beforeEach: [hook1],
            afterEach: [hook1],
            after: hook1,
          },
          weave: {
            before: hook1,
            beforeEach: hook1,
            // afterEach: undefined,
            // after: undefined,
          },
          print: {
            parse: {
              // before: undefined,
              //   =============
              after: hook1,
            },
            inject: {
              before: hook1,
            },
            // write:undefined
          },
        },
      },
      {
        hooks: {
          gather: {
            before: [hook2],
            beforeEach: hook2,
            // afterEach: undefined,
            after: [hook2],
          },
          weave: {
            before: hook2,
            // beforeEach: undefined,
            afterEach: [hook2],
            after: hook2,
          },
          print: {
            parse: {
              // before: undefined
              //   =============
              after: [],
            },
            // inject: undefined,
            write: {
              before: [],
              after: hook2,
            },
          },
        },
      },
    ),
  ).toStrictEqual({
    hooks: {
      gather: {
        before: [hook1, hook2],
        beforeEach: [hook1, hook2],
        afterEach: [hook1],
        after: [hook1, hook2],
      },
      weave: {
        before: [hook1, hook2],
        beforeEach: hook1,
        afterEach: hook2,
        after: hook2,
      },
      print: {
        parse: {
          after: hook1,
        },
        inject: {
          before: hook1,
        },
        write: {
          before: [],
          after: hook2,
        },
      },
    },
  });
});
