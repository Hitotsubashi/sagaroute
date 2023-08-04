// @ts-nocheck
import React from 'react';
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import SrcPagesUsers_Id_ from "./src/pages/users/[id].tsx";
import SrcPagesIndex from "./src/pages/index.tsx";
import SrcPages404 from "./src/pages/404.tsx";
/* injected by sagaroute: end */

function getRoutes() {
  /* sagaroute-inject:routes */
  return [
  {
    "path": "users",
    "children": [
      {
        "path": ":id",
        "element": <SrcPagesUsers_Id_/>
      }
    ]
  },
  {
    "path": "/",
    "element": <SrcPagesIndex/>
  },
  {
    "path": "*",
    "element": <SrcPages404/>
  }
];
}
export default getRoutes;