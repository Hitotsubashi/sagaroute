/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PagesAccountPermission from "./pages/account/permission.tsx";
import PagesIndex from "./pages/index.tsx";
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "account",
    "children": [
      {
        "path": "permission",
        "element": <PagesAccountPermission/>
      }
    ]
  },
  {
    "path": "/",
    "element": <PagesIndex/>
  }
];
export default routes;