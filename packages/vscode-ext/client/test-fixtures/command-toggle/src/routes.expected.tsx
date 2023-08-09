/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import LayoutsIndex from "./layouts/index.tsx";
import PagesIndex from "./pages/index.tsx";
/* injected by sagaroute: end */

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
  }
];
export default routes;