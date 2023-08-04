// @ts-nocheck
/* sagaroute-inject: prefix */
/* injected by sagaroute: start */
import React from "react";
/* injected by sagaroute: end */

// sagaroute-inject: constantRoutes
export const constantRoutes = [
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

/* sagaroute-inject: asyncRoutes */
export const asyncRoutes = [
  {
    "path": "permission",
    "element": <SrcPagesPermissionIndex/>
  }
];