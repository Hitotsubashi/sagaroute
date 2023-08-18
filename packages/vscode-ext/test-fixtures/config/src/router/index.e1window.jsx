/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import ComponentsErrorBoundary from "../components/ErrorBoundary";
import ViewsIndex from "../views/index.jsx";
import ViewsUserIndex from "../views/user/index.jsx";
import ViewsUserRole from "../views/user/[role].jsx";
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
        "index": true,
        "errorElement": <ComponentsErrorBoundary />,
        "element": <ViewsUserIndex/>
      },
      {
        "path": ":role",
        "element": <ViewsUserRole/>
      }
    ]
  }
];
export default routes;