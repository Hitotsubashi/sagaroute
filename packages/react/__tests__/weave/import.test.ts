import { FileNode } from '@/gather';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import weave, { Imports, RouteObject } from '@/weave';
import path from 'path';

test('fileNode with dependency', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'head.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'head.tsx'),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary2>
          <PagesComponentsErrorBoundary2Header text="header" />
          <PagesComponentsErrorBoundary2Context text="context" />
        </PagesComponentsErrorBoundary2>`,
        },
      },
      dependencies: [
        {
          name: 'ErrorBoundary2',
          asName: 'PagesComponentsErrorBoundary2',
          importPath: './pages/components/ErrorBoundary2.tsx',
          isDefault: true,
        },
        {
          name: 'Header',
          asName: 'PagesComponentsErrorBoundary2Header',
          importPath: './pages/components/ErrorBoundary2.tsx',
          isDefault: false,
        },
        {
          name: 'Context',
          asName: 'PagesComponentsErrorBoundary2Context',
          importPath: './pages/components/ErrorBoundary2.tsx',
          isDefault: false,
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'index.tsx'),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary></PagesComponentsErrorBoundary>`,
        },
      },
      dependencies: [
        {
          name: 'ErrorBoundary',
          asName: 'PagesComponentsErrorBoundary',
          importPath: './pages/components/ErrorBoundary.tsx',
          isDefault: true,
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: 'head',
      element: `${EVAL_STRING_SYMBOL}<PagesHead/>`,
      errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary2>
          <PagesComponentsErrorBoundary2Header text="header" />
          <PagesComponentsErrorBoundary2Context text="context" />
        </PagesComponentsErrorBoundary2>`,
    },
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
      errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary></PagesComponentsErrorBoundary>`,
    },
  ];
  const imports: Imports = {
    './pages/head.tsx': [
      {
        name: 'head',
        asName: 'PagesHead',
        isDefault: true,
      },
    ],
    './pages/components/ErrorBoundary2.tsx': [
      {
        name: 'ErrorBoundary2',
        asName: 'PagesComponentsErrorBoundary2',
        isDefault: true,
      },
      {
        name: 'Header',
        asName: 'PagesComponentsErrorBoundary2Header',
        isDefault: false,
      },
      {
        name: 'Context',
        asName: 'PagesComponentsErrorBoundary2Context',
        isDefault: false,
      },
    ],
    './pages/index.tsx': [
      {
        name: 'index',
        asName: 'PagesIndex',
        isDefault: true,
      },
    ],
    './pages/components/ErrorBoundary.tsx': [
      {
        name: 'ErrorBoundary',
        asName: 'PagesComponentsErrorBoundary',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
    }),
  ).toStrictEqual({ routes, imports });
});

test('has different dependency in same source during different fileNode', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'user.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'user.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader1`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB1 text="error1"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader1',
          asName: 'loader1',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary1',
          asName: 'EB1',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: false,
        },
      ],
    },
    {
      name: 'account.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'account.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader2`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB2 text="error2"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader2',
          asName: 'loader2',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary2',
          asName: 'EB2',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: false,
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      layoutNode: true,
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader3`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB3 text="error3"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader3',
          asName: 'loader3',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary3',
          asName: 'EB3',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: false,
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      loader: `${EVAL_STRING_SYMBOL}loader3`,
      ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB3 text="error3"/>`,
      children: [
        {
          path: 'user',
          element: `${EVAL_STRING_SYMBOL}<PagesUser/>`,
          loader: `${EVAL_STRING_SYMBOL}loader1`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB1 text="error1"/>`,
        },
        {
          path: 'account',
          element: `${EVAL_STRING_SYMBOL}<PagesAccount/>`,
          loader: `${EVAL_STRING_SYMBOL}loader2`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB2 text="error2"/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './layouts/index.tsx': [
      {
        name: 'index',
        asName: 'LayoutsIndex',
        isDefault: true,
      },
    ],
    './pages/user.tsx': [
      {
        name: 'user',
        asName: 'PagesUser',
        isDefault: true,
      },
    ],
    './pages/account.tsx': [
      {
        name: 'account',
        asName: 'PagesAccount',
        isDefault: true,
      },
    ],
    '@/utils/loader.ts': [
      {
        name: 'loader3',
        asName: 'loader3',
        isDefault: false,
      },
      {
        name: 'loader1',
        asName: 'loader1',
        isDefault: false,
      },
      {
        name: 'loader2',
        asName: 'loader2',
        isDefault: false,
      },
    ],
    '@/components/ErrorBoundary.tsx': [
      {
        name: 'ErrorBoundary3',
        asName: 'EB3',
        isDefault: false,
      },
      {
        name: 'ErrorBoundary1',
        asName: 'EB1',
        isDefault: false,
      },
      {
        name: 'ErrorBoundary2',
        asName: 'EB2',
        isDefault: false,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      relativeLayoutDirPath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'layouts'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});

test('has same dependency during different fileNode', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'user.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'user.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error1"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader',
          asName: 'loader',
          importPath: '@/utils/loader.ts',
          isDefault: true,
        },
        {
          name: 'ErrorBoundary',
          asName: 'EB',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: true,
        },
      ],
    },
    {
      name: 'account.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'account.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error2"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader',
          asName: 'loader',
          importPath: '@/utils/loader.ts',
          isDefault: true,
        },
        {
          name: 'ErrorBoundary',
          asName: 'EB',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: true,
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      layoutNode: true,
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}loader`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error3"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader',
          asName: 'loader',
          importPath: '@/utils/loader.ts',
          isDefault: true,
        },
        {
          name: 'ErrorBoundary',
          asName: 'EB',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: true,
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      loader: `${EVAL_STRING_SYMBOL}loader`,
      ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error3"/>`,
      children: [
        {
          path: 'user',
          element: `${EVAL_STRING_SYMBOL}<PagesUser/>`,
          loader: `${EVAL_STRING_SYMBOL}loader`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error1"/>`,
        },
        {
          path: 'account',
          element: `${EVAL_STRING_SYMBOL}<PagesAccount/>`,
          loader: `${EVAL_STRING_SYMBOL}loader`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<EB text="error2"/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './layouts/index.tsx': [
      {
        name: 'index',
        asName: 'LayoutsIndex',
        isDefault: true,
      },
    ],
    './pages/user.tsx': [
      {
        name: 'user',
        asName: 'PagesUser',
        isDefault: true,
      },
    ],
    './pages/account.tsx': [
      {
        name: 'account',
        asName: 'PagesAccount',
        isDefault: true,
      },
    ],
    '@/utils/loader.ts': [
      {
        name: 'loader',
        asName: 'loader',
        isDefault: true,
      },
    ],
    '@/components/ErrorBoundary.tsx': [
      {
        name: 'ErrorBoundary',
        asName: 'EB',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      relativeLayoutDirPath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'layouts'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});

test('has multiple dependencies in lazy fileNode', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'index.tsx',
      type: 'file',
      layoutNode: true,
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}UtilsLoader`,
          loader1: `${EVAL_STRING_SYMBOL}UtilsLoader1`,
          loader2: `${EVAL_STRING_SYMBOL}UtilsLoader2`,
        },
      },
      dependencies: [
        {
          name: 'loader',
          asName: 'UtilsLoader',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'loader1',
          asName: 'UtilsLoader1',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'loader2',
          asName: 'UtilsLoader2',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'index.tsx'),
      props: {
        routeProps: {
          loader: `${EVAL_STRING_SYMBOL}UtilsLoader`,
          action: `${EVAL_STRING_SYMBOL}PagesIndexAction`,
          handle: `${EVAL_STRING_SYMBOL}UtilsHandle`,
          ErrorBoundary: `${EVAL_STRING_SYMBOL}<ComponentsErrorBoundary text="error1"/>`,
        },
      },
      dependencies: [
        {
          name: 'loader',
          asName: 'UtilsLoader',
          importPath: '@/utils/loader.ts',
          isDefault: false,
        },
        {
          name: 'ErrorBoundary',
          asName: 'ComponentsErrorBoundary',
          importPath: '@/components/ErrorBoundary.tsx',
          isDefault: true,
        },
        {
          name: 'action',
          asName: 'PagesIndexAction',
          importPath: './pages/index.tsx',
          isDefault: false,
        },
        {
          name: '*',
          asName: 'UtilsHandle',
          importPath: './utils/handle.tsx',
          isDefault: true,
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: '/',
      lazy: `${EVAL_STRING_SYMBOL}async function(){
        const {loader: UtilsLoader,loader1: UtilsLoader1,loader2: UtilsLoader2} = await import("@/utils/loader.ts");
        const {default : LayoutsIndex } = await import("./layouts/index.tsx");
        return {
          "Component": LayoutsIndex,
          "loader": UtilsLoader,
          "loader1": UtilsLoader1,
          "loader2": UtilsLoader2
        };
      }`,
      children: [
        {
          index: true,
          lazy: `${EVAL_STRING_SYMBOL}async function(){
            const {loader: UtilsLoader} = await import("@/utils/loader.ts");
            const {default: ComponentsErrorBoundary} = await import("@/components/ErrorBoundary.tsx");
            const {action: PagesIndexAction,default : PagesIndex } = await import("./pages/index.tsx");
            const UtilsHandle = await import("./utils/handle.tsx");
            return {
              "Component": PagesIndex,
              "loader": UtilsLoader,
              "action": PagesIndexAction,
              "handle":  UtilsHandle,
              "ErrorBoundary": <ComponentsErrorBoundary text="error1"/>
            };
          }`,
        },
      ],
    },
  ];
  const imports: Imports = {};
  expect(
    weave(fileNodes, {
      lazy: true,
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      relativeLayoutDirPath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'layouts'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});
