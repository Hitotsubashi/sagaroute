/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import ComponentsErrorBoundary from "../components/ErrorBoundary";
import ViewsIndex from "../views/index.jsx";
import ViewsUserRole from "../views/user/[role].jsx";
import ViewsUserIndex from "../views/user/index.jsx";
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "ErrorBoundary": ComponentsErrorBoundary,
    "element": <ViewsIndex/>
  },
  {
    "path": "user",
    "children": [
      {
        "path": ":role",
        "element": <ViewsUserRole/>
      },
      {
        "index": true,
        "errorElement": <ComponentsErrorBoundary />,
        "element": <ViewsUserIndex/>
      }
    ]
  }
];
export default routes;