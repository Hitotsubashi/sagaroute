/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PagesIndex from "./pages/index.tsx";
import PagesPermission from "./layouts/index.tsx";
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "element": <PagesIndex/>,
  },
  {
    "path": "account",
    "children": [
      {
        "path": "permission",
        "element": <PagesIndex/>,
      }
    ]
  }
];
export default routes;