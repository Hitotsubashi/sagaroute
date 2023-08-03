import { FileNode } from "@/gather";
import weave, { Imports, RouteObject } from "@/weave";
import { EVAL_STRING_SYMBOL } from "@/utils/symbol";
import path from "path";

test("test weave with route include layout", () => {
  const fileNodes: FileNode[] = [
    {
      name: "index.tsx",
      type: "file",
      path: path.join("project", "src", "pages", "index.tsx"),
    },
    {
      name: "index.tsx",
      type: "file",
      layoutNode: true,
      path: path.join("project", "src", "layouts", "index.tsx"),
    },
    {
      name: "404.tsx",
      type: "file",
      path: path.join("project", "src", "pages", "404.tsx"),
    },
    {
      name: "403.tsx",
      type: "file",
      path: path.join("project", "src", "pages", "403.tsx"),
      props: {
        routeOptions: {
          layout: false,
        },
      },
    },
  ];
  const routes: RouteObject[] = [
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
        },
      ],
    },
    {
      path: "*",
      element: `${EVAL_STRING_SYMBOL}<Pages404/>`,
    },
    {
      path: "403",
      element: `${EVAL_STRING_SYMBOL}<Pages403/>`,
    },
  ];
  const imports: Imports = {
    "./layouts/index.tsx": [
      {
        name: "index",
        asName: "LayoutsIndex",
        isDefault: true,
      },
    ],
    "./pages/index.tsx": [
      {
        name: "index",
        asName: "PagesIndex",
        isDefault: true,
      },
    ],
    "./pages/404.tsx": [
      {
        name: "404",
        asName: "Pages404",
        isDefault: true,
      },
    ],
    "./pages/403.tsx": [
      {
        name: "403",
        asName: "Pages403",
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "pages")
      ),
      relativeLayoutDirPath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "layouts")
      ),
    })
  ).toStrictEqual({ routes, imports });
});

test("test weave with deep nest", () => {
  const fileNodes: FileNode[] = [
    {
      name: "index.tsx",
      type: "file",
      path: path.join("project", "src", "pages", "index.tsx"),
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join("project", "src", "layouts", "index.tsx"),
      layoutNode: true,
    },
    {
      name: "404.tsx",
      type: "file",
      path: path.join("project", "src", "pages", "404.tsx"),
    },
    {
      name: "c",
      type: "dir",
      path: path.join("project", "src", "pages", "c"),
      children: [
        {
          name: "c1.tsx",
          type: "file",
          path: path.join("project", "src", "pages", "c", "c1.tsx"),
        },
        {
          name: "cc",
          type: "dir",
          path: path.join("project", "src", "pages", "cc"),
          children: [
            {
              name: "cc1.tsx",
              type: "file",
              path: path.join("project", "src", "pages", "cc", "cc1.tsx"),
            },
            {
              name: "ccc",
              type: "dir",
              path: path.join("project", "src", "pages", "cc", "ccc"),
              children: [
                {
                  name: "ccc1.tsx",
                  type: "file",
                  path: path.join(
                    "project",
                    "src",
                    "pages",
                    "cc",
                    "ccc",
                    "ccc1.tsx"
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  const routes = [
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
      children: [
        {
          index: true,
          element: `${EVAL_STRING_SYMBOL}<PagesIndex/>`,
        },
        {
          path: "c",
          children: [
            {
              path: "c1",
              element: `${EVAL_STRING_SYMBOL}<PagesCC1/>`,
            },
            {
              path: "cc",
              children: [
                {
                  path: "cc1",
                  element: `${EVAL_STRING_SYMBOL}<PagesCCcCc1/>`,
                },
                {
                  path: "ccc",
                  children: [
                    {
                      path: "ccc1",
                      element: `${EVAL_STRING_SYMBOL}<PagesCCcCccCcc1/>`,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: `${EVAL_STRING_SYMBOL}<Pages404/>`,
    },
  ];
  const imports: Imports = {
    "./layouts/index.tsx": [
      {
        name: "index",
        asName: "LayoutsIndex",
        isDefault: true,
      },
    ],
    "./pages/index.tsx": [
      {
        name: "index",
        asName: "PagesIndex",
        isDefault: true,
      },
    ],
    "./pages/c/c1.tsx": [
      {
        name: "c1",
        asName: "PagesCC1",
        isDefault: true,
      },
    ],
    "./pages/c/cc/cc1.tsx": [
      {
        name: "cc1",
        asName: "PagesCCcCc1",
        isDefault: true,
      },
    ],
    "./pages/c/cc/ccc/ccc1.tsx": [
      {
        name: "ccc1",
        asName: "PagesCCcCccCcc1",
        isDefault: true,
      },
    ],
    "./pages/404.tsx": [
      {
        name: "404",
        asName: "Pages404",
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "pages")
      ),
      relativeLayoutDirPath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "layouts")
      ),
    })
  ).toStrictEqual({ routes, imports });
});

test("test weave with only one layoutNode", () => {
  const fileNodes: FileNode[] = [
    {
      name: "index.tsx",
      type: "file",
      layoutNode: true,
      path: path.join("project", "src", "layouts", "index.tsx"),
    },
  ];
  const routes: RouteObject[] = [
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
    },
  ];
  const imports: Imports = {
    "./layouts/index.tsx": [
      {
        name: "index",
        asName: "LayoutsIndex",
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "pages")
      ),
      relativeLayoutDirPath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "layouts")
      ),
    })
  ).toStrictEqual({ routes, imports });
});

test("test weave with only one layoutNode and deeper route", () => {
  const fileNodes: FileNode[] = [
    {
      name: "index.tsx",
      type: "file",
      layoutNode: true,
      path: path.join("project", "src", "layouts", "index.tsx"),
    },
  ];
  const routes: RouteObject[] = [
    {
      path: "/",
      element: `${EVAL_STRING_SYMBOL}<LayoutsIndex/>`,
    },
  ];
  const imports: Imports = {
    "../layouts/index.tsx": [
      {
        name: "index",
        asName: "LayoutsIndex",
        isDefault: true,
      },
    ],
  };
  expect(
    weave(fileNodes, {
      relativeDirpath: path.relative(
        path.join("src", "routes.tsx"),
        path.join("src", "pages")
      ),
      relativeLayoutDirPath: path.relative(
        path.join("src", "router", "routes.tsx"),
        path.join("src", "layouts")
      ),
    })
  ).toStrictEqual({ routes, imports });
});
