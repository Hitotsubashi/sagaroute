/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PagesIndex from "@/pages/index.tsx";
import PagesPermissionAccountList from "@/pages/permission/AccountList.tsx";
import PagesPermissionRoleList from "@/pages/permission/RoleList.tsx";
/* injected by sagaroute: end */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "element": <PagesIndex/>
  },
  {
    "path": "permission",
    "children": [
      {
        "path": "account-list",
        "element": <PagesPermissionAccountList/>
      },
      {
        "path": "role-list",
        "element": <PagesPermissionRoleList/>
      }
    ]
  }
];
export default routes;