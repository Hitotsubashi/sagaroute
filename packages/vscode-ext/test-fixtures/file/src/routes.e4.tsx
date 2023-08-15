/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import LayoutsIndex from "./layouts/index.tsx";
import PagesAccountIndex from "./pages/account/index.tsx";
import PagesAccountPermission from "./pages/account/permission.tsx";
import PagesIndex from "./pages/index.tsx";
import PagesUser1Layout from "./pages/user1/_layout.tsx";
import Pages404 from "./pages/404.tsx";
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "element": <LayoutsIndex/>,
    "children": [
      {
        "path": "account",
        "children": [
          {
            "path": "index",
            "index": false,
            "element": <PagesAccountIndex/>
          },
          {
            "path": "permission",
            "element": <PagesAccountPermission/>
          }
        ]
      },
      {
        "index": true,
        "element": <PagesIndex/>
      },
      {
        "path": "user1",
        "element": <PagesUser1Layout/>
      }
    ]
  },
  {
    "path": "*",
    "element": <Pages404/>
  }
];
export default routes;