// @ts-nocheck
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import DashboardIndex from './dashboard/index.tsx';
import ViewsIndex from './views/index.tsx';
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    path: '/',
    element: <DashboardIndex />,
    children: [
      {
        index: true,
        element: <ViewsIndex />,
      },
    ],
  },
];
export default routes;
