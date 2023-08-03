import fs from "fs";
import path from "path";
import { EVAL_STRING_SYMBOL } from "@/utils/symbol";
import print from "@/print";
import { Imports, RouteObject } from "@/weave";

test("test print with normal routes by comment: //", () => {
  const routes: RouteObject[] = [
    {
      path: "users",
      children: [
        {
          path: ":id",
          element: `${EVAL_STRING_SYMBOL}<SrcPagesUsers_Id_/>`,
        },
      ],
    },
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<SrcPagesIndex/>`,
    },
    {
      path: "*",
      element: `${EVAL_STRING_SYMBOL}<SrcPages404/>`,
    },
  ];
  const imports: Imports = {
    "./src/pages/users/[id].tsx": [
      {
        name: "User",
        asName: "SrcPagesUsers_Id_",
        isDefault: true,
      },
    ],
    "./src/pages/index.tsx": [
      {
        name: "Index",
        asName: "SrcPagesIndex",
        isDefault: true,
      },
    ],
    "./src/pages/404.tsx": [
      {
        name: "Page404",
        asName: "SrcPages404",
        isDefault: true,
      },
    ],
  };
  const routeFilePath = path.join(
    __dirname,
    "ignore-test-render",
    "route1.tsx"
  );
  print(routes, imports, { routeFilePath });
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});

test("test print with normal routes by comment: /**/", () => {
  const routes: RouteObject[] = [
    {
      path: "users",
      children: [
        {
          path: ":id",
          element: `${EVAL_STRING_SYMBOL}<SrcPagesUsers_Id_/>`,
        },
      ],
    },
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<SrcPagesIndex/>`,
    },
    {
      path: "*",
      element: `${EVAL_STRING_SYMBOL}<SrcPages404/>`,
    },
  ];
  const imports: Imports = {
    "./src/pages/users/[id].tsx": [
      {
        name: "User",
        asName: "SrcPagesUsers_Id_",
        isDefault: true,
      },
    ],
    "./src/pages/index.tsx": [
      {
        name: "Index",
        asName: "SrcPagesIndex",
        isDefault: true,
      },
    ],
    "./src/pages/404.tsx": [
      {
        name: "Page404",
        asName: "SrcPages404",
        isDefault: true,
      },
    ],
  };
  const routeFilePath = path.join(
    __dirname,
    "ignore-test-render",
    "route2.tsx"
  );
  print(routes, imports, { routeFilePath });
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});

test("print with multiple imports", () => {
  const routes: RouteObject[] = [
    {
      path: "users",
      element: `${EVAL_STRING_SYMBOL}<PagesUsers/>`,
      action: `${EVAL_STRING_SYMBOL}action1`,
      loader1: `${EVAL_STRING_SYMBOL}loader.loader1`,
    },
    {
      path: "dashboard",
      Component: `${EVAL_STRING_SYMBOL}<PagesDashboard/>`,
      action: `${EVAL_STRING_SYMBOL}action2`,
      loader1: `${EVAL_STRING_SYMBOL}loader.loader2`,
    },
    {
      path: "chart",
      Component: `${EVAL_STRING_SYMBOL}<PagesChart/>`,
      action: `${EVAL_STRING_SYMBOL}defaultAction`,
      loader1: `${EVAL_STRING_SYMBOL}loader3`,
      errorElement: `${EVAL_STRING_SYMBOL}<PagesChartError/>`,
    },
  ];

  const imports: Imports = {
    "@/utils/action.ts": [
      {
        name: "action1",
        asName: "action1",
        isDefault: false,
      },
      {
        name: "action2",
        asName: "action2",
        isDefault: false,
      },
      {
        name: "default",
        asName: "defaultAction",
        isDefault: false,
      },
    ],
    "@/utils/loader.ts": [
      {
        name: "*",
        asName: "loader",
        isDefault: true,
      },
      {
        name: "loader3",
        asName: "loader3",
        isDefault: false,
      },
    ],
    "@/pages/users.tsx": [
      {
        name: "users",
        asName: "PagesUsers",
        isDefault: true,
      },
    ],
    "@/pages/dashboard.tsx": [
      {
        name: "dashboard",
        asName: "PagesDashboard",
        isDefault: true,
      },
    ],
    "@/pages/chart.tsx": [
      {
        name: "chart",
        asName: "PagesChart",
        isDefault: true,
      },
      {
        name: "Error",
        asName: "PagesChartError",
        isDefault: false,
      },
    ],
  };

  const routeFilePath = path.join(
    __dirname,
    "ignore-test-render",
    "route8.tsx"
  );
  print(routes, imports, { routeFilePath });
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});
