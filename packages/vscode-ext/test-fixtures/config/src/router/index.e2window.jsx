/* sagaroute-inject:imports */

// sagaroute-inject: routes
const routes = [
  {
    "path": "/",
    "lazy": async function() {
    const {default: ComponentsErrorBoundary}  = await import("../components/ErrorBoundary");
const {default : ViewsIndex}  = await import("../views/index.jsx");
    return {
  "Component": ViewsIndex,
  "ErrorBoundary": ComponentsErrorBoundary
};
  }
  },
  {
    "path": "user",
    "children": [
      {
        "index": true,
        "lazy": async function() {
      const {default: ComponentsErrorBoundary}  = await import("../components/ErrorBoundary");
      const {default : ViewsUserIndex}  = await import("../views/user/index.jsx");
      return {
      "Component": ViewsUserIndex,
      "errorElement": <ComponentsErrorBoundary />
      };
      }
      },
      {
        "path": ":role",
        "lazy": async function() {
    const {default : ViewsUserRole}  = await import("../views/user/[role].jsx");
    return {
  "Component": ViewsUserRole
};
  }
      }
    ]
  }
];
export default routes;