// @ts-nocheck
// sagaroute-inject:imports
// sagaroute-inject:prefix
/* injected by sagaroute: start */
import React from 'react';
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "lazy": async function() {
    const {default : LayoutsIndex}  = await import("./layouts/index.tsx");
    return {
  "Component": LayoutsIndex
};
  },
    "children": [
      {
        "index": true,
        "lazy": async function() {
    const {default: React}  = await import("react");
const {default : PagesIndex}  = await import("./pages/index.tsx");
    return {
  "Component": PagesIndex,
  "errorElement": <React.Fragement>
      <div>error...</div>
      <button>back</button>
    </React.Fragement>
};
  }
      }
    ]
  }
];
export default routes;