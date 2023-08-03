import gather from '@/gather';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import path from 'path';

test('gather fileNodes with multiple type of variables.', () => {
  const gatherDirPath = path.join('__tests__', 'gather', 'ignore-test-type');
  const exist = gather({
    dirpath: path.join(gatherDirPath, 'pages'),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, 'routes.tsx'),
      path.join(gatherDirPath, 'pages'),
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join(gatherDirPath, 'pages', 'index.tsx'),
      props: {
        routeProps: {
          string: 'string',
          number: 1.2,
          boolean: true,
          null: null,
          undefined: `${EVAL_STRING_SYMBOL}undefined`,
          symbol: `${EVAL_STRING_SYMBOL}Symbol("s")`,
          funtion: `${EVAL_STRING_SYMBOL}function () {}`,
          object: `${EVAL_STRING_SYMBOL}{}`,
          array: `${EVAL_STRING_SYMBOL}[]`,
          map: `${EVAL_STRING_SYMBOL}new Map()`,
          proxy: `${EVAL_STRING_SYMBOL}new Proxy()`,
          errorElement: `${EVAL_STRING_SYMBOL}<ComponentsErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: 'ErrorBoundary',
          asName: 'ComponentsErrorBoundary',
          importPath: './components/ErrorBoundary',
          isDefault: true,
        },
      ],
    },
  ]);
});
