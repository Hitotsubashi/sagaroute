// @ts-nocheck
/* sagaroute-inject:imports */

// sagaroute-inject: routes
const routes = [
  {
    path: '/',
    lazy: async function () {
      const { default: LayoutsIndex } = await import('./layouts/index.tsx');
      return {
        Component: LayoutsIndex,
      };
    },
    children: [
      {
        index: true,
        lazy: async function () {
          const { default: PagesIndex } = await import('./pages/index.tsx');
          return {
            Component: PagesIndex,
          };
        },
      },
    ],
  },
  {
    path: '*',
    lazy: async function () {
      const { default: Pages404 } = await import('./pages/404.tsx');
      return {
        Component: Pages404,
      };
    },
  },
];
export default routes;
