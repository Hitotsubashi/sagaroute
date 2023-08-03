import { FileNode } from '@/gather';
import weave, { Imports, RouteObject } from '@/weave';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import path from 'path';

test('test weave with route that not lazy', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      layoutNode: true,
    },
    {
      name: 'a.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'a.tsx'),
    },
    {
      name: 'b',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'b'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', '_layout.tsx'),
        },
        {
          name: 'b1.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', 'b1.tsx'),
        },
        {
          name: 'bb',
          type: 'dir',
          path: path.join('project', 'src', 'pages', 'b', 'bb'),
          children: [
            {
              name: 'bb1.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', 'bb1.tsx'),
            },
            {
              name: '_layout.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', '_layout.tsx'),
            },
          ],
        },
      ],
    },
    {
      name: 'c.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'c.tsx'),
    },
  ];

  const routes: RouteObject[] = [
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      children: [
        {
          path: 'a',
          element: `${EVAL_STRING_SYMBOL}<PagesA/>`,
        },
        {
          path: 'b',
          element: `${EVAL_STRING_SYMBOL}<PagesBLayout/>`,
          children: [
            {
              path: 'b1',
              element: `${EVAL_STRING_SYMBOL}<PagesBB1/>`,
            },
            {
              path: 'bb',
              element: `${EVAL_STRING_SYMBOL}<PagesBBbLayout/>`,
              children: [
                {
                  path: 'bb1',
                  element: `${EVAL_STRING_SYMBOL}<PagesBBbBb1/>`,
                },
              ],
            },
          ],
        },
        {
          path: 'c',
          element: `${EVAL_STRING_SYMBOL}<PagesC/>`,
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
    './pages/a.tsx': [
      {
        name: 'a',
        asName: 'PagesA',
        isDefault: true,
      },
    ],
    './pages/b/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesBLayout',
        isDefault: true,
      },
    ],
    './pages/b/b1.tsx': [
      {
        name: 'b1',
        asName: 'PagesBB1',
        isDefault: true,
      },
    ],
    './pages/b/bb/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesBBbLayout',
        isDefault: true,
      },
    ],
    './pages/b/bb/bb1.tsx': [
      {
        name: 'bb1',
        asName: 'PagesBBbBb1',
        isDefault: true,
      },
    ],
    './pages/c.tsx': [
      {
        name: 'c',
        asName: 'PagesC',
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

test('test weave with route that partial lazy in routeOptions', () => {
  const fileNodes: FileNode[] = [
    {
      // lazy
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      layoutNode: true,
    },
    {
      name: 'a.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'a.tsx'),
    },
    {
      name: 'b',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'b'),
      children: [
        {
          // lazy
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', '_layout.tsx'),
          props: {
            routeProps: {
              action: `${EVAL_STRING_SYMBOL}async ({ request }: any) => {
                const formData = await request.formData();
                return formData;
              }`,
            },
          },
        },
        {
          // lazy
          name: 'b1.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', 'b1.tsx'),
          props: {
            routeProps: {
              loader: `${EVAL_STRING_SYMBOL}async function(){
                const data = await fetch('/user');
                return data;
              }`,
            },
          },
        },
        {
          name: 'bb',
          type: 'dir',
          path: path.join('project', 'src', 'pages', 'b', 'bb'),
          children: [
            {
              // lazy
              name: 'bb1.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', 'bb1.tsx'),
            },
            {
              name: '_layout.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', '_layout.tsx'),
            },
          ],
        },
      ],
    },
    {
      name: 'c.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'c.tsx'),
    },
  ];

  const routes: RouteObject[] = [
    {
      path: '/',
      lazy: `${EVAL_STRING_SYMBOL}async function () {
        const {default: LayoutsIndex} = await import("./layouts/index.tsx");
        return { "Component": LayoutsIndex };
      }`,
      children: [
        {
          path: 'a',
          element: `${EVAL_STRING_SYMBOL}<PagesA/>`,
        },
        {
          path: 'b',
          lazy: `${EVAL_STRING_SYMBOL}async function () {
            const {default: PagesBLayout} = await import("./pages/b/_layout.tsx");
            return {
              "Component": PagesBLayout,
              "action": async ({ request }: any) => {
                const formData = await request.formData();
                return formData;
              }
            };
          }`,
          children: [
            {
              path: 'b1',
              lazy: `${EVAL_STRING_SYMBOL}async function () {
                const {default: PagesBB1} = await import("./pages/b/b1.tsx");
                return { 
                  "Component": PagesBB1,
                  "loader": async function(){
                    const data = await fetch('/user');
                    return data;
                  }
                };
              }`,
            },
            {
              path: 'bb',
              element: `${EVAL_STRING_SYMBOL}<PagesBBbLayout/>`,
              children: [
                {
                  path: 'bb1',
                  lazy: `${EVAL_STRING_SYMBOL}async function () {
                    const {default : PagesBBbBb1} = await import("./pages/b/bb/bb1.tsx");
                    return { "Component": PagesBBbBb1 };
                  }`,
                },
              ],
            },
          ],
        },
        {
          path: 'c',
          element: `${EVAL_STRING_SYMBOL}<PagesC/>`,
        },
      ],
    },
  ];

  const imports: Imports = {
    './pages/a.tsx': [
      {
        name: 'a',
        asName: 'PagesA',
        isDefault: true,
      },
    ],
    './pages/b/bb/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesBBbLayout',
        isDefault: true,
      },
    ],
    './pages/c.tsx': [
      {
        name: 'c',
        asName: 'PagesC',
        isDefault: true,
      },
    ],
  };

  const lazyList = [
    path.join('project', 'src', 'layouts', 'index.tsx'),
    path.join('project', 'src', 'pages', 'b', '_layout.tsx'),
    path.join('project', 'src', 'pages', 'b', 'b1.tsx'),
    path.join('project', 'src', 'pages', 'b', 'bb', 'bb1.tsx'),
  ];

  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      relativeLayoutDirPath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'layouts'),
      ),
      lazy: (filepath: string) => {
        return lazyList.some((item) => filepath.includes(item));
      },
    }),
  ).toStrictEqual({ routes, imports });
});

test('test weave with global lazy,and some route set not lazy in routeProps and routeOptions', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'index.tsx',
      type: 'file',
      layoutNode: true,
      path: path.join('project', 'src', 'layouts', 'index.tsx'),
      props: {
        routeProps: {
          lazy: `${EVAL_STRING_SYMBOL}async function () {
            const {default: Component} = await import('@/layouts/index.tsx');
            return { Component };
          }`,
        },
      },
    },
    {
      name: 'a.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'a.tsx'),
    },
    {
      name: 'b',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'b'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', '_layout.tsx'),
          props: {
            routeProps: {
              action: `${EVAL_STRING_SYMBOL}async ({ request }: any) => {
                const formData = await request.formData();
                return formData;
              }`,
            },
          },
        },
        {
          name: 'b1.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'b', 'b1.tsx'),
          props: {
            routeProps: {
              loader: `${EVAL_STRING_SYMBOL}async function(){
                const data = await fetch('/user');
                return data;
              }`,
              lazy: `${EVAL_STRING_SYMBOL}async function () {
                const {default: Component} = await import('@/pages/b/b1.tsx');
                return { Component };
              }`,
            },
          },
        },
        {
          name: 'bb',
          type: 'dir',
          path: path.join('project', 'src', 'pages', 'b', 'bb'),
          children: [
            {
              name: 'bb1.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', 'bb1.tsx'),
            },
            {
              name: '_layout.tsx',
              type: 'file',
              path: path.join('project', 'src', 'pages', 'b', 'bb', '_layout.tsx'),
            },
          ],
        },
      ],
    },
    {
      name: 'c.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'c.tsx'),
    },
  ];

  const routes: RouteObject[] = [
    {
      path: '/',
      lazy: `${EVAL_STRING_SYMBOL}async function () {
        const {default: Component} = await import('@/layouts/index.tsx');
        return { Component };
      }`,
      children: [
        {
          path: 'a',
          lazy: `${EVAL_STRING_SYMBOL}async function () {
            const {default : PagesA} = await import("@/pages/a.tsx");
            return { "Component": PagesA };
          }`,
        },
        {
          path: 'b',
          element: `${EVAL_STRING_SYMBOL}<PagesBLayout/>`,
          action: `${EVAL_STRING_SYMBOL}async ({ request }: any) => {
            const formData = await request.formData();
            return formData;
          }`,
          children: [
            {
              path: 'b1',
              loader: `${EVAL_STRING_SYMBOL}async function(){
                const data = await fetch('/user');
                return data;
              }`,
              lazy: `${EVAL_STRING_SYMBOL}async function () {
                const {default: Component} = await import('@/pages/b/b1.tsx');
                return { Component };
              }`,
            },
            {
              path: 'bb',
              lazy: `${EVAL_STRING_SYMBOL}async function () {
                const {default:PagesBBbLayout} = await import("@/pages/b/bb/_layout.tsx");
                return { "Component": PagesBBbLayout };
              }`,
              children: [
                {
                  path: 'bb1',
                  lazy: `${EVAL_STRING_SYMBOL}async function () {
                    const {default: PagesBBbBb1} = await import("@/pages/b/bb/bb1.tsx");
                    return { "Component": PagesBBbBb1 };
                  }`,
                },
              ],
            },
          ],
        },
        {
          path: 'c',
          lazy: `${EVAL_STRING_SYMBOL}async function () {
            const {default: PagesC} = await import("@/pages/c.tsx");
            return { "Component": PagesC };
          }`,
        },
      ],
    },
  ];

  const imports: Imports = {
    '@/pages/b/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesBLayout',
        isDefault: true,
      },
    ],
  };

  const notLazyList = [path.join('project', 'src', 'pages', 'b', '_layout.tsx')];

  expect(
    weave(fileNodes, {
      lazy: (filepath) => {
        return !notLazyList.some((item) => filepath.includes(item));
      },
      pathRewrite: [[new RegExp('./'), '@/']],
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      relativeLayoutDirPath: path.relative(
        path.join('src', 'routes.tsx'),
        path.join('src', 'layouts'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});
