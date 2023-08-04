import { FileNode } from '@/gather';
import weave, { Imports, RouteObject } from '@/weave';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import path from 'path';

test('test weave with route include 404,dynamic,index', () => {
  const fileNodes: FileNode[] = [
    {
      name: '[post]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[post]'),
      children: [
        {
          name: 'index.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', '[post]', 'index.tsx'),
        },
        {
          name: 'comments.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', '[post]', 'comments.tsx'),
        },
      ],
    },
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),

      children: [
        {
          name: '[id].tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '[id].tsx'),
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'index.tsx'),
    },
    {
      name: '404.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', '404.tsx'),
    },
  ];
  const routes: RouteObject[] = [
    {
      path: ':post',
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesPostIndex/>`,
        },
        {
          path: 'comments',
          element: `${EVAL_STRING_SYMBOL}<PagesPostComments/>`,
        },
      ],
    },
    {
      path: 'users',
      children: [
        {
          path: ':id',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersId/>`,
        },
      ],
    },
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
    },
    {
      path: '*',
      element: `${EVAL_STRING_SYMBOL}<Pages404/>`,
    },
  ];
  const imports: Imports = {
    './pages/[post]/index.tsx': [
      {
        name: 'index',
        asName: 'PagesPostIndex',
        isDefault: true,
      },
    ],
    './pages/[post]/comments.tsx': [
      {
        name: 'comments',
        asName: 'PagesPostComments',
        isDefault: true,
      },
    ],
    './pages/users/[id].tsx': [
      {
        name: '[id]',
        asName: 'PagesUsersId',
        isDefault: true,
      },
    ],
    './pages/index.tsx': [
      {
        name: 'index',
        asName: 'PagesIndex',
        isDefault: true,
      },
    ],
    './pages/404.tsx': [
      {
        name: '404',
        asName: 'Pages404',
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

test('test weave with route include 404,dynamic,index and deep routes', () => {
  const fileNodes: FileNode[] = [
    {
      name: '[post]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[post]'),
      children: [
        {
          name: 'index.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'index.tsx'),
        },
        {
          name: 'comments.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'comments.tsx'),
        },
      ],
    },
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '[id].tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '[id].tsx'),
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'index.tsx'),
    },
    {
      name: '404.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', '404.tsx'),
    },
  ];
  const routes: RouteObject[] = [
    {
      path: ':post',
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesPostIndex/>`,
        },
        {
          path: 'comments',
          element: `${EVAL_STRING_SYMBOL}<PagesPostComments/>`,
        },
      ],
    },
    {
      path: 'users',
      children: [
        {
          path: ':id',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersId/>`,
        },
      ],
    },
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
    },
    {
      path: '*',
      element: `${EVAL_STRING_SYMBOL}<Pages404/>`,
    },
  ];
  const imports: Imports = {
    '../pages/[post]/index.tsx': [
      {
        name: 'index',
        asName: 'PagesPostIndex',
        isDefault: true,
      },
    ],
    '../pages/[post]/comments.tsx': [
      {
        name: 'comments',
        asName: 'PagesPostComments',
        isDefault: true,
      },
    ],
    '../pages/users/[id].tsx': [
      {
        name: '[id]',
        asName: 'PagesUsersId',
        isDefault: true,
      },
    ],
    '../pages/index.tsx': [
      {
        name: 'index',
        asName: 'PagesIndex',
        isDefault: true,
      },
    ],
    '../pages/404.tsx': [
      {
        name: '404',
        asName: 'Pages404',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join('src', 'router', 'routes.tsx'),
        path.join('src', 'pages'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});

test('test weave with route include routeProps.index=false', () => {
  const fileNodes: FileNode[] = [
    {
      name: '[post]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[post]'),
      children: [
        {
          name: 'index.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'index.tsx'),
          props: {
            routeProps: {
              index: false,
            },
          },
        },
        {
          name: 'comments.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'comments.tsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: ':post',
      children: [
        {
          index: false,
          path: 'index',
          element: `${EVAL_STRING_SYMBOL}<PagesPostIndex/>`,
        },
        {
          path: 'comments',
          element: `${EVAL_STRING_SYMBOL}<PagesPostComments/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    '../pages/[post]/index.tsx': [
      {
        name: 'index',
        asName: 'PagesPostIndex',
        isDefault: true,
      },
    ],
    '../pages/[post]/comments.tsx': [
      {
        name: 'comments',
        asName: 'PagesPostComments',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join('src', 'router', 'routes.tsx'),
        path.join('src', 'pages'),
      ),
    }),
  ).toStrictEqual({ routes, imports });
});

test('test weave with route include optional,index,empty', () => {
  const fileNodes: FileNode[] = [
    {
      name: '[post$]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[post$]'),
      children: [
        {
          name: 'comments.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'comments.tsx'),
        },
      ],
    },
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '[id$].tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '[id$].tsx'),
        },
      ],
    },
    {
      name: '[bar]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[bar]'),
      children: [
        {
          name: '[].tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', '[bar]', '[].tsx'),
        },
      ],
    },
    {
      name: 'index.tsx',
      type: 'file',
      path: path.join('project', 'src', 'pages', 'index.tsx'),
    },
  ];
  const routes: RouteObject[] = [
    {
      path: ':post?',
      children: [
        {
          path: 'comments',
          element: `${EVAL_STRING_SYMBOL}<PagesPostComments/>`,
        },
      ],
    },
    {
      path: 'users',
      children: [
        {
          path: ':id?',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersId/>`,
        },
      ],
    },
    {
      path: ':bar',
      children: [
        {
          path: '*',
          element: `${EVAL_STRING_SYMBOL}<PagesBar_/>`,
        },
      ],
    },
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
    },
  ];
  const imports: Imports = {
    './pages/[post$]/comments.tsx': [
      {
        name: 'comments',
        asName: 'PagesPostComments',
        isDefault: true,
      },
    ],
    './pages/users/[id$].tsx': [
      {
        name: '[id$]',
        asName: 'PagesUsersId',
        isDefault: true,
      },
    ],
    './pages/[bar]/[].tsx': [
      {
        name: '[]',
        asName: 'PagesBar_',
        isDefault: true,
      },
    ],
    './pages/index.tsx': [
      {
        name: 'index',
        asName: 'PagesIndex',
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

test('test weave with route include _layout and index.tsx', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '_layout.tsx'),
        },
        {
          name: 'index.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'index.tsx'),
        },
        {
          name: 'list.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'list.tsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: 'users',
      element: `${EVAL_STRING_SYMBOL}<PagesUsersLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesUsersIndex/>`,
        },
        {
          path: 'list',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersList/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './pages/users/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesUsersLayout',
        isDefault: true,
      },
    ],
    './pages/users/index.tsx': [
      {
        name: 'index',
        asName: 'PagesUsersIndex',
        isDefault: true,
      },
    ],
    './pages/users/list.tsx': [
      {
        name: 'list',
        asName: 'PagesUsersList',
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

test('test weave with route include _layout and index=true', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '_layout.tsx'),
        },
        {
          name: 'a.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'a.tsx'),
          props: { routeProps: { index: true } },
        },
        {
          name: 'b.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'b.tsx'),
        },
        {
          name: 'c.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'c.tsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: 'users',
      element: `${EVAL_STRING_SYMBOL}<PagesUsersLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesUsersA/>`,
        },
        {
          path: 'b',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersB/>`,
        },
        {
          path: 'c',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersC/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './pages/users/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesUsersLayout',
        isDefault: true,
      },
    ],
    './pages/users/a.tsx': [
      {
        name: 'a',
        asName: 'PagesUsersA',
        isDefault: true,
      },
    ],
    './pages/users/b.tsx': [
      {
        name: 'b',
        asName: 'PagesUsersB',
        isDefault: true,
      },
    ],
    './pages/users/c.tsx': [
      {
        name: 'c',
        asName: 'PagesUsersC',
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

test('test weave with pathRewrite', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '_layout.tsx'),
        },
        {
          name: 'index.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'index.tsx'),
        },
        {
          name: 'list.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'list.tsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: 'users',
      element: `${EVAL_STRING_SYMBOL}<PagesUsersLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesUsersIndex/>`,
        },
        {
          path: 'list',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersList/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    '@/pages/users/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesUsersLayout',
        isDefault: true,
      },
    ],
    '@/pages/users/index.tsx': [
      {
        name: 'index',
        asName: 'PagesUsersIndex',
        isDefault: true,
      },
    ],
    '@/pages/users/list.tsx': [
      {
        name: 'list',
        asName: 'PagesUsersList',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      pathRewrite: [[new RegExp(`^./`), '@/']],
    }),
  ).toStrictEqual({ routes, imports });
});

test('test weave with hoooks', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const beforeFn = jest.fn((fileNodes: FileNode[]) => {});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const beforeEachFn = jest.fn((fileNode: FileNode) => {});
  const afterEachFn = jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (route: RouteObject | null, imports: Imports, fileNode: FileNode) => {},
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const afterFn = jest.fn((routes: RouteObject[], imports: Imports, fileNodes: FileNode[]) => {});

  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),

      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '_layout.tsx'),
        },
        {
          name: 'a.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'a.tsx'),
          props: { routeProps: { index: true } },
        },
        {
          name: 'b.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'b.tsx'),
        },
        {
          name: 'c.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'c.tsx'),
        },
      ],
    },
  ];

  const routes: RouteObject[] = [
    {
      path: 'users',
      element: `${EVAL_STRING_SYMBOL}<PagesUsersLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesUsersA/>`,
        },
        {
          path: 'b',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersB/>`,
        },
        {
          path: 'c',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersC/>`,
        },
      ],
    },
  ];

  const imports: Imports = {
    './pages/users/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesUsersLayout',
        isDefault: true,
      },
    ],
    './pages/users/a.tsx': [
      {
        name: 'a',
        asName: 'PagesUsersA',
        isDefault: true,
      },
    ],
    './pages/users/b.tsx': [
      {
        name: 'b',
        asName: 'PagesUsersB',
        isDefault: true,
      },
    ],
    './pages/users/c.tsx': [
      {
        name: 'c',
        asName: 'PagesUsersC',
        isDefault: true,
      },
    ],
  };

  weave(fileNodes, {
    relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
    hooks: {
      before: [beforeFn],
      beforeEach: [beforeEachFn],
      afterEach: [afterEachFn],
      after: [afterFn],
    },
  });

  expect(beforeFn.mock.calls).toHaveLength(1);
  expect(beforeFn.mock.calls[0][0]).toBe(fileNodes);

  expect(beforeEachFn.mock.calls).toHaveLength(4);
  expect(beforeEachFn.mock.calls[0][0]).toBe(fileNodes[0]);
  expect(beforeEachFn.mock.calls[1][0]).toBe(fileNodes[0].children![1]);
  expect(beforeEachFn.mock.calls[2][0]).toBe(fileNodes[0].children![2]);
  expect(beforeEachFn.mock.calls[3][0]).toBe(fileNodes[0].children![3]);

  expect(afterEachFn.mock.calls).toHaveLength(4);

  expect(afterEachFn.mock.calls[0][0]).toStrictEqual(routes[0].children![0]);
  expect(afterEachFn.mock.calls[0][1]).toStrictEqual({
    './pages/users/a.tsx': imports['./pages/users/a.tsx'],
  });
  expect(afterEachFn.mock.calls[0][2]).toStrictEqual(fileNodes[0].children![1]);

  expect(afterEachFn.mock.calls[1][0]).toStrictEqual(routes[0].children![1]);
  expect(afterEachFn.mock.calls[1][1]).toStrictEqual({
    './pages/users/b.tsx': imports['./pages/users/b.tsx'],
  });
  expect(afterEachFn.mock.calls[1][2]).toStrictEqual(fileNodes[0].children![2]);

  expect(afterEachFn.mock.calls[2][0]).toStrictEqual(routes[0].children![2]);
  expect(afterEachFn.mock.calls[2][1]).toStrictEqual({
    './pages/users/c.tsx': imports['./pages/users/c.tsx'],
  });
  expect(afterEachFn.mock.calls[2][2]).toStrictEqual(fileNodes[0].children![3]);

  expect(afterEachFn.mock.calls[3][0]).toStrictEqual(routes[0]);
  expect(afterEachFn.mock.calls[3][1]).toStrictEqual(imports);
  expect(afterEachFn.mock.calls[3][2]).toStrictEqual(fileNodes[0]);

  expect(afterFn.mock.calls).toHaveLength(1);
  expect(afterFn.mock.calls[0][0]).toStrictEqual(routes);
  expect(afterFn.mock.calls[0][1]).toStrictEqual(imports);
  expect(afterFn.mock.calls[0][2]).toStrictEqual(fileNodes);
});

test('test weave with hoooks dong skip', () => {
  const beforeEachFn = (fileNode: FileNode) => {
    if (fileNode.props?.routeOptions?.ignore) {
      return null;
    }
  };

  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: '_layout.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', '_layout.tsx'),
        },
        {
          name: 'a.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'a.tsx'),
          props: { routeProps: { index: true } },
        },
        {
          name: 'b.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'b.tsx'),
          props: { routeOptions: { ignore: true } },
        },
        {
          name: 'c.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'c.tsx'),
        },
      ],
    },
  ];

  const routes: RouteObject[] = [
    {
      path: 'users',
      element: `${EVAL_STRING_SYMBOL}<PagesUsersLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesUsersA/>`,
        },
        {
          path: 'c',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersC/>`,
        },
      ],
    },
  ];

  const imports: Imports = {
    './pages/users/_layout.tsx': [
      {
        name: '_layout',
        asName: 'PagesUsersLayout',
        isDefault: true,
      },
    ],
    './pages/users/a.tsx': [
      {
        name: 'a',
        asName: 'PagesUsersA',
        isDefault: true,
      },
    ],
    './pages/users/c.tsx': [
      {
        name: 'c',
        asName: 'PagesUsersC',
        isDefault: true,
      },
    ],
  };

  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      hooks: {
        beforeEach: [beforeEachFn],
      },
    }),
  ).toStrictEqual({ routes, imports });
});

test('test weave with first route include _layout file which props.routeOptions.layout is true', () => {
  const fileNodes: FileNode[] = [
    {
      name: '[post]',
      type: 'dir',
      path: path.join('project', 'src', 'pages', '[post]'),

      children: [
        {
          name: '_layout.jsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', '[post]', '_layout.jsx'),
          props: { routeOptions: { layout: false } },
        },
        {
          name: 'index.jsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', '[post]', 'index.jsx'),
        },
      ],
    },
    {
      name: 'index.jsx',
      type: 'file',
      layoutNode: true,
      path: path.join('project', 'src', 'layouts', 'index.jsx'),
    },
    {
      name: 'user',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'user'),
      children: [
        {
          name: '[account].jsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'user', '[account].jsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: '/',
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      children: [
        {
          path: 'user',
          children: [
            {
              path: ':account',
              element: `${EVAL_STRING_SYMBOL}<PagesUserAccount/>`,
            },
          ],
        },
      ],
    },
    {
      path: ':post',
      element: `${EVAL_STRING_SYMBOL}<PagesPostLayout/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesPostIndex/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './layouts/index.jsx': [
      {
        name: 'index',
        asName: 'LayoutsIndex',
        isDefault: true,
      },
    ],
    './pages/user/[account].jsx': [
      {
        name: '[account]',
        asName: 'PagesUserAccount',
        isDefault: true,
      },
    ],
    './pages/[post]/_layout.jsx': [
      {
        name: '_layout',
        asName: 'PagesPostLayout',
        isDefault: true,
      },
    ],
    './pages/[post]/index.jsx': [
      {
        name: 'index',
        asName: 'PagesPostIndex',
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

test('weave with hook for toLowercase', () => {
  const fileNodes: FileNode[] = [
    {
      name: 'users',
      type: 'dir',
      path: path.join('project', 'src', 'pages', 'users'),
      children: [
        {
          name: 'RoleList.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'RoleList.tsx'),
        },
        {
          name: 'GroupManage.tsx',
          type: 'file',
          path: path.join('project', 'src', 'pages', 'users', 'GroupManage.tsx'),
        },
      ],
    },
  ];
  const routes: RouteObject[] = [
    {
      path: 'users',
      children: [
        {
          path: 'role-list',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersRoleList/>`,
        },
        {
          path: 'group-manage',
          element: `${EVAL_STRING_SYMBOL}<PagesUsersGroupManage/>`,
        },
      ],
    },
  ];
  const imports: Imports = {
    './pages/users/RoleList.tsx': [
      {
        name: 'RoleList',
        asName: 'PagesUsersRoleList',
        isDefault: true,
      },
    ],
    './pages/users/GroupManage.tsx': [
      {
        name: 'GroupManage',
        asName: 'PagesUsersGroupManage',
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(path.join('src', 'routes.tsx'), path.join('src', 'pages')),
      hooks: {
        afterEach: [
          (route) => {
            route.path = route.path
              ?.replace(/([A-Z])/g, '-$1')
              .replace(/^-/, '')
              .toLocaleLowerCase();
          },
        ],
      },
    }),
  ).toStrictEqual({ routes, imports });
});
