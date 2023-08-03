// @ts-nocheck
// sagaroute-inject:imports
/* injected by sagaroute: start */
import ComponentsErrorBoundary from '../components/ErrorBoundary';
import PagesIndex from '../pages/index.tsx';
import PagesUser from '../pages/user.tsx';
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    path: '/',
    ErrorBoundary: ComponentsErrorBoundary,
    element: <PagesIndex />,
  },
  {
    path: 'user',
    errorElement: <ComponentsErrorBoundary />,
    element: <PagesUser />,
  },
];
export default routes;
