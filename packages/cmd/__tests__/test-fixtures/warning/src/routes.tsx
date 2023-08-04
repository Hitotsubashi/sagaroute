// @ts-nocheck
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import LayoutsIndex from "./layouts/index.tsx";
import PagesIndex from "./pages/index.tsx";
import Pages404 from "./pages/404.tsx";
/* injected by sagaroute: end */

/* sagaroute-inject:prefix */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "element": <LayoutsIndex/>,
    "children": [
      {
        "index": true,
        "element": <PagesIndex/>
      }
    ]
  },
  {
    "path": "*",
    "element": <Pages404/>
  }
];
export default routes;