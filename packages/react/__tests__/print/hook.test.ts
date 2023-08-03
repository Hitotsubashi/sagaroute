import print from "@/print";
import { EVAL_STRING_SYMBOL } from "@/utils/symbol";
import path from "path";
import fs from "fs";
import Mustache from "mustache";
import { Imports, RouteObject } from "@/weave";
import { transformRoutesToString } from "@/index";

test("test print with hooks", () => {
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
    {
      path: "permission",
      element: `${EVAL_STRING_SYMBOL}<SrcPagesPermissionIndex/>`,
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
    "./src/pages/permission/index.tsx": [
      {
        name: "Permission",
        asName: "SrcPagesPermissionIndex",
        isDefault: true,
      },
    ],
  };
  const routeFilePath = path.join(
    __dirname,
    "ignore-test-render",
    "route3.tsx"
  );

  const printHookBeforeParse = jest.fn((routeFilePath: string) => {});
  const printHookAfterParse = jest.fn(
    (template: string, routeFilePath: string) => {}
  );
  const printHookBeforeInject = jest.fn(
    (view: Record<string, any>, template: string, routes: RouteObject[]) => {
      view["constantRoutes"] = transformRoutesToString(
        routes.filter((item: any) => item.path !== "permission")
      );
      view["asyncRoutes"] = transformRoutesToString(
        routes.filter((item: any) => item.path === "permission")
      );
      view["prefix"] = `import React from "react";`;
    }
  );
  const printHookAfterInject = jest.fn(() => {});

  print(routes, imports, {
    routeFilePath,
    hooks: {
      parse: {
        before: [printHookBeforeParse],
        after: [printHookAfterParse],
      },
      inject: {
        before: [printHookBeforeInject],
        after: [printHookAfterInject],
      },
    },
  });
  expect(printHookBeforeParse.mock.calls).toHaveLength(1);
  expect(printHookBeforeParse.mock.calls[0]).toStrictEqual([routeFilePath]);
  expect(printHookAfterParse.mock.calls).toHaveLength(1);
  expect(printHookAfterParse.mock.calls[0][1]).toBe(routeFilePath);
  expect(printHookBeforeInject.mock.calls).toHaveLength(1);
  expect(printHookAfterInject.mock.calls).toHaveLength(1);

  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});

test("test print with hook using custom template", () => {
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
    "route5.tsx"
  );
  print(routes, imports, {
    routeFilePath,
    hooks: {
      parse: {
        before: [
          () => {
            return fs.readFileSync(
              path.join(__dirname, "ignore-test-render", "route5.tpl"),
              "utf-8"
            );
          },
        ],
      },
    },
  });
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});

test("test print with hook skip render.", () => {
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
    "route6.tsx"
  );
  print(routes, imports, {
    routeFilePath,
    hooks: {
      inject: {
        before: [
          (view, template) => {
            return Mustache.render(template, {
              routes: 1,
              imports: ['import xx from "xxx";'].join("\n"),
            });
          },
        ],
      },
    },
  });
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});

test("test print with hook skip write.", () => {
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
    "route7.tsx"
  );
  let renderContentRecord = "";
  print(routes, imports, {
    routeFilePath,
    hooks: {
      write: {
        before: [
          (renderedContent: string) => {
            renderContentRecord = renderedContent;
            return null;
          },
        ],
      },
    },
  });
  expect(renderContentRecord).toMatchSnapshot();
  const context = fs.readFileSync(routeFilePath, "utf-8");
  expect(context).toMatchSnapshot();
});
