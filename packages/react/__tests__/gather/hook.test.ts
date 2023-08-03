import gather from '@/gather';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import path from 'path';

test('gather fileNodes from normal document without hook.', () => {
  const gatherDirPath = path.join('__tests__', 'gather', 'ignore-test-hook');
  const adjustedDirPath = '__tests__/gather/ignore-test-hook';
  const exist = gather({
    dirpath: path.join(gatherDirPath, 'pages'),
    layoutDirPath: path.join(gatherDirPath, 'layouts'),
    relativeDirpath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'pages'),
    ),
    relativeLayoutDirPath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'layouts'),
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: 'A.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'A.tsx'),
    },
    {
      name: 'B.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'B.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader1`,
          action: `${EVAL_STRING_SYMBOL}UtilsActionAction`,
          errorElement: `${EVAL_STRING_SYMBOL}<PagesCompErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: 'loader1',
          asName: 'UtilsLoaderLoader1',
          importPath: '@/utils/loader',
          isDefault: false,
        },
        {
          name: 'action',
          asName: 'UtilsActionAction',
          importPath: '@/utils/action',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary',
          asName: 'PagesCompErrorBoundary',
          importPath: '@/pages/comp/ErrorBoundary',
          isDefault: true,
        },
      ],
    },
    {
      name: 'c',
      type: 'dir',
      path: path.join(gatherDirPath, 'pages', 'c'),
      children: [
        {
          name: 'C1.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'c', 'C1.tsx'),
          props: {
            routeOptions: {
              lazy: true,
            },
          },
        },
      ],
    },
    {
      name: 'comp',
      type: 'dir',
      path: path.join(gatherDirPath, 'pages', 'comp'),
      children: [
        {
          name: 'C.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'comp', 'C.tsx'),
        },
        {
          name: 'ErrorBoundary.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'comp', 'ErrorBoundary.tsx'),
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'index.tsx'),
    },
    {
      name: 'index.jsx',
      type: 'file',
      path: path.join(gatherDirPath, 'layouts', 'index.jsx'),
      layoutNode: true,
    },
  ]);
});

test('gather fileNodes from normal document with hook doing cache.', () => {
  const gatherDirPath = path.join('__tests__', 'gather', 'ignore-test-hook');
  const adjustedDirPath = '__tests__/gather/ignore-test-hook';
  const exist = gather({
    dirpath: path.join(gatherDirPath, 'pages'),
    layoutDirPath: path.join(gatherDirPath, 'layouts'),
    relativeDirpath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'pages'),
    ),
    relativeLayoutDirPath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'layouts'),
    ),
    hooks: {
      beforeEach: [
        (fileNodePath) => {
          if (fileNodePath === path.join(gatherDirPath, 'pages', 'B.tsx')) {
            return {
              name: 'B.tsx',
              type: 'file',
              path: path.join(gatherDirPath, 'pages', 'B.tsx'),
            };
          }
          if (fileNodePath === path.join(gatherDirPath, 'pages', 'A.tsx')) {
            return {
              name: 'A.tsx',
              type: 'file',
              path: path.join(gatherDirPath, 'pages', 'A.tsx'),
              props: {
                routeProps: {
                  loader: `${EVAL_STRING_SYMBOL}loader1`,
                  action: `${EVAL_STRING_SYMBOL}action`,
                },
              },
              dependencies: [
                {
                  name: 'loader1',
                  asName: 'loader1',
                  importPath: '@/utils/loader',
                  isDefault: false,
                },
                {
                  name: 'action',
                  asName: 'action',
                  importPath: '@/utils/action',
                  isDefault: false,
                },
              ],
            };
          }
          if (fileNodePath === path.join(gatherDirPath, 'layouts')) {
            return {
              name: 'index.jsx',
              type: 'file',
              layoutNode: true,
              path: path.join(gatherDirPath, 'layouts', 'index.jsx'),
              props: {
                routeOptions: {
                  lazy: true,
                },
              },
            };
          }
        },
      ],
    },
  });
  expect(exist).toStrictEqual([
    {
      name: 'A.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'A.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader1`,
          action: `${EVAL_STRING_SYMBOL}action`,
        },
      },
      dependencies: [
        {
          name: 'loader1',
          asName: 'loader1',
          importPath: '@/utils/loader',
          isDefault: false,
        },
        {
          name: 'action',
          asName: 'action',
          importPath: '@/utils/action',
          isDefault: false,
        },
      ],
    },
    {
      name: 'B.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'B.tsx'),
    },
    {
      name: 'c',
      type: 'dir',
      path: path.join(gatherDirPath, 'pages', 'c'),
      children: [
        {
          name: 'C1.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'c', 'C1.tsx'),
          props: {
            routeOptions: {
              lazy: true,
            },
          },
        },
      ],
    },
    {
      name: 'comp',
      type: 'dir',
      path: path.join(gatherDirPath, 'pages', 'comp'),
      children: [
        {
          name: 'C.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'comp', 'C.tsx'),
        },
        {
          name: 'ErrorBoundary.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'comp', 'ErrorBoundary.tsx'),
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'index.tsx'),
    },
    {
      name: 'index.jsx',
      type: 'file',
      layoutNode: true,
      path: path.join(gatherDirPath, 'layouts', 'index.jsx'),
      props: {
        routeOptions: {
          lazy: true,
        },
      },
    },
  ]);
});

test('gather fileNodes from normal document with hook doing skip.', () => {
  const gatherDirPath = path.join('__tests__', 'gather', 'ignore-test-hook');
  const adjustedDirPath = '__tests__/gather/ignore-test-hook';
  const exist = gather({
    dirpath: path.join(gatherDirPath, 'pages'),
    layoutDirPath: path.join(gatherDirPath, 'layouts'),
    relativeDirpath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'pages'),
    ),
    relativeLayoutDirPath: path.relative(
      path.join(adjustedDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'layouts'),
    ),
    hooks: {
      beforeEach: [
        (fileNodePath) => {
          const ignoreDir = path.sep + 'comp' + path.sep;
          if (fileNodePath.includes(ignoreDir)) {
            return null;
          }
        },
      ],
    },
  });
  expect(exist).toStrictEqual([
    {
      name: 'A.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'A.tsx'),
    },
    {
      name: 'B.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'B.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}UtilsLoaderLoader1`,
          action: `${EVAL_STRING_SYMBOL}UtilsActionAction`,
          errorElement: `${EVAL_STRING_SYMBOL}<PagesCompErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: 'loader1',
          asName: 'UtilsLoaderLoader1',
          importPath: '@/utils/loader',
          isDefault: false,
        },
        {
          name: 'action',
          asName: 'UtilsActionAction',
          importPath: '@/utils/action',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary',
          asName: 'PagesCompErrorBoundary',
          importPath: '@/pages/comp/ErrorBoundary',
          isDefault: true,
        },
      ],
    },
    {
      name: 'c',
      type: 'dir',
      path: path.join(gatherDirPath, 'pages', 'c'),
      children: [
        {
          name: 'C1.tsx',
          type: 'file',
          path: path.join(gatherDirPath, 'pages', 'c', 'C1.tsx'),
          props: {
            routeOptions: {
              lazy: true,
            },
          },
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'index.tsx'),
    },
    {
      name: 'index.jsx',
      type: 'file',
      layoutNode: true,
      path: path.join(gatherDirPath, 'layouts', 'index.jsx'),
    },
  ]);
});
