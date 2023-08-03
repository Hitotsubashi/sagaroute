// @ts-nocheck
import React from 'react';
import SrcPagesUsers_Id_ from './src/pages/users/[id].tsx';
import SrcPagesIndex from './src/pages/index.tsx';
import SrcPages404 from './src/pages/404.tsx';

const routes = [
  {
    path: 'users',
    children: [
      {
        path: ':id',
        element: <SrcPagesUsers_Id_ />,
      },
    ],
  },
  {
    path: '/',
    element: <SrcPagesIndex />,
  },
  {
    path: '*',
    element: <SrcPages404 />,
  },
];

const router = createBrowserRouter(routes);

export default router;
