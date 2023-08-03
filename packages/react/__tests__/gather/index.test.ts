import gather, { FileNode } from "@/gather";
import path from "path";
import { EVAL_STRING_SYMBOL } from "@/utils/symbol";

test("gather fileNodes from normal document,includes tsx in routeProps.", () => {
  // cmd路径 /packages/react
  const gatherDirPath = path.join("__tests__", "gather", "ignore-test-dir");
  const adjustedDirPath = "__tests__/gather/ignore-test-dir";
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(adjustedDirPath, "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: "1.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "1.tsx"),
      props: {
        routeOptions: {
          layout: false,
          lazy: true,
        },
      },
    },
    {
      name: "a",
      type: "dir",
      path: path.join(gatherDirPath, "pages", "a"),
      children: [
        {
          name: "a1.tsx",
          type: "file",
          path: path.join(gatherDirPath, "pages", "a", "a1.tsx"),
          props: {
            routeProps: {
              role: `${EVAL_STRING_SYMBOL}["amdin"]`,
              errorElement: `${EVAL_STRING_SYMBOL}<ComponentsErrorEle />`,
            },
          },
          dependencies: [
            {
              name: "ErrorEle",
              asName: "ComponentsErrorEle",
              importPath: "@/components/ErrorEle.tsx",
              isDefault: true,
            },
          ],
        },
      ],
    },
    {
      name: "c",
      type: "dir",
      path: path.join(gatherDirPath, "pages", "c"),
      children: [
        {
          name: "c1.tsx",
          type: "file",
          path: path.join(gatherDirPath, "pages", "c", "c1.tsx"),
        },
        {
          name: "cc",
          type: "dir",
          path: path.join(gatherDirPath, "pages", "c", "cc"),
          children: [
            {
              name: "cc1.tsx",
              type: "file",
              path: path.join(gatherDirPath, "pages", "c", "cc", "cc1.tsx"),
            },
            {
              name: "ccc",
              type: "dir",
              path: path.join(gatherDirPath, "pages", "c", "cc", "ccc"),
              children: [
                {
                  name: "ccc1.tsx",
                  type: "file",
                  path: path.join(
                    gatherDirPath,
                    "pages",
                    "c",
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
  ]);
});

test("test tsx in routeProps,whick comes from multiple sources", () => {
  const gatherDirPath = path.join(
    "__tests__",
    "gather",
    "ignore-test-jsx-sources"
  );
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: "footer.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "footer.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<div>
            <PagesComponentsTitle title="title" />
            <PagesComponentsText />
          </div>`,
        },
      },
      dependencies: [
        {
          name: "Title",
          asName: "PagesComponentsTitle",
          importPath: "./pages/components/Title.tsx",
          isDefault: true,
        },
        {
          name: "*",
          asName: "PagesComponentsText",
          importPath: "./pages/components/Text.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "head.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "head.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary2>
          <PagesComponentsErrorBoundary2Header text="header" />
          <PagesComponentsErrorBoundary2Context text="context" />
        </PagesComponentsErrorBoundary2>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary2",
          asName: "PagesComponentsErrorBoundary2",
          importPath: "./pages/components/ErrorBoundary2.tsx",
          isDefault: true,
        },
        {
          name: "Header",
          asName: "PagesComponentsErrorBoundary2Header",
          importPath: "./pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
        {
          name: "Context",
          asName: "PagesComponentsErrorBoundary2Context",
          importPath: "./pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
      ],
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary></PagesComponentsErrorBoundary>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "./pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "list.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "list.tsx"),
      props: {
        routeProps: {
          ErrorBoundary: `${EVAL_STRING_SYMBOL}PagesComponentsErrorBoundary`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "./pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "table.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "table.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary1 show>
          <PagesComponentsText />
          <AntdInput />
        </PagesComponentsErrorBoundary1>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary1",
          asName: "PagesComponentsErrorBoundary1",
          importPath: "./pages/components/ErrorBoundary1.tsx",
          isDefault: true,
        },
        {
          name: "Text",
          asName: "PagesComponentsText",
          importPath: "./pages/components/Text.tsx",
          isDefault: true,
        },
        {
          name: "Input",
          asName: "AntdInput",
          importPath: "antd",
          isDefault: false,
        },
      ],
    },
  ]);
});

test("test tsx in routeProps,whick comes from multiple sources and has deeper route.ts", () => {
  const gatherDirPath = path.join(
    "__tests__",
    "gather",
    "ignore-test-jsx-sources"
  );
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, "router", "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: "footer.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "footer.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<div>
          <PagesComponentsTitle title="title" />
          <PagesComponentsText />
        </div>`,
        },
      },
      dependencies: [
        {
          name: "Title",
          asName: "PagesComponentsTitle",
          importPath: "../pages/components/Title.tsx",
          isDefault: true,
        },
        {
          name: "*",
          asName: "PagesComponentsText",
          importPath: "../pages/components/Text.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "head.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "head.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary2>
          <PagesComponentsErrorBoundary2Header text="header" />
          <PagesComponentsErrorBoundary2Context text="context" />
        </PagesComponentsErrorBoundary2>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary2",
          asName: "PagesComponentsErrorBoundary2",
          importPath: "../pages/components/ErrorBoundary2.tsx",
          isDefault: true,
        },
        {
          name: "Header",
          asName: "PagesComponentsErrorBoundary2Header",
          importPath: "../pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
        {
          name: "Context",
          asName: "PagesComponentsErrorBoundary2Context",
          importPath: "../pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
      ],
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary></PagesComponentsErrorBoundary>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "../pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "list.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "list.tsx"),
      props: {
        routeProps: {
          ErrorBoundary: `${EVAL_STRING_SYMBOL}PagesComponentsErrorBoundary`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "../pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "table.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "table.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary1 show>
          <PagesComponentsText />
          <AntdInput />
        </PagesComponentsErrorBoundary1>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary1",
          asName: "PagesComponentsErrorBoundary1",
          importPath: "../pages/components/ErrorBoundary1.tsx",
          isDefault: true,
        },
        {
          name: "Text",
          asName: "PagesComponentsText",
          importPath: "../pages/components/Text.tsx",
          isDefault: true,
        },
        {
          name: "Input",
          asName: "AntdInput",
          importPath: "antd",
          isDefault: false,
        },
      ],
    },
  ]);
});

test("test tsx in routeProps,whick set pathRewrite.", () => {
  const gatherDirPath = path.join(
    "__tests__",
    "gather",
    "ignore-test-jsx-sources"
  );
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
    pathRewrite: [[new RegExp(`^./`), "@/"]],
  });
  expect(exist).toStrictEqual([
    {
      name: "footer.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "footer.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<div>
          <PagesComponentsTitle title="title" />
          <PagesComponentsText />
        </div>`,
        },
      },
      dependencies: [
        {
          name: "Title",
          asName: "PagesComponentsTitle",
          importPath: "@/pages/components/Title.tsx",
          isDefault: true,
        },
        {
          name: "*",
          asName: "PagesComponentsText",
          importPath: "@/pages/components/Text.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "head.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "head.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary2>
          <PagesComponentsErrorBoundary2Header text="header" />
          <PagesComponentsErrorBoundary2Context text="context" />
        </PagesComponentsErrorBoundary2>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary2",
          asName: "PagesComponentsErrorBoundary2",
          importPath: "@/pages/components/ErrorBoundary2.tsx",
          isDefault: true,
        },
        {
          name: "Header",
          asName: "PagesComponentsErrorBoundary2Header",
          importPath: "@/pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
        {
          name: "Context",
          asName: "PagesComponentsErrorBoundary2Context",
          importPath: "@/pages/components/ErrorBoundary2.tsx",
          isDefault: false,
        },
      ],
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary></PagesComponentsErrorBoundary>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "@/pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "list.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "list.tsx"),
      props: {
        routeProps: {
          ErrorBoundary: `${EVAL_STRING_SYMBOL}PagesComponentsErrorBoundary`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "PagesComponentsErrorBoundary",
          importPath: "@/pages/components/ErrorBoundary.tsx",
          isDefault: true,
        },
      ],
    },
    {
      name: "table.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "table.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<PagesComponentsErrorBoundary1 show>
          <PagesComponentsText />
          <AntdInput />
        </PagesComponentsErrorBoundary1>`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary1",
          asName: "PagesComponentsErrorBoundary1",
          importPath: "@/pages/components/ErrorBoundary1.tsx",
          isDefault: true,
        },
        {
          name: "Text",
          asName: "PagesComponentsText",
          importPath: "@/pages/components/Text.tsx",
          isDefault: true,
        },
        {
          name: "Input",
          asName: "AntdInput",
          importPath: "antd",
          isDefault: false,
        },
      ],
    },
  ]);
});

test("gather fileNodes from normal document,includes layouts and pages.", () => {
  const gatherDirPath = path.join("__tests__", "gather", "ignore-test-layout");
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
    layoutDirPath: path.join(gatherDirPath, "layouts"),
    relativeLayoutDirPath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "layouts")
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<ComponentsErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "ComponentsErrorBoundary",
          importPath: "./components/ErrorBoundary",
          isDefault: true,
        },
      ],
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "layouts", "index.tsx"),
      layoutNode: true,
    },
  ]);
});

test("gather fileNodes from normal document,includes empty layouts and pages.", () => {
  const gatherDirPath = path.join(
    "__tests__",
    "gather",
    "ignore-test-empty-layout"
  );
  const exist = gather({
    dirpath: path.join(gatherDirPath, "pages"),
    relativeDirpath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "pages")
    ),
    layoutDirPath: path.join(gatherDirPath, "layouts"),
    relativeLayoutDirPath: path.relative(
      path.join(gatherDirPath, "routes.tsx"),
      path.join(gatherDirPath, "layouts")
    ),
  });
  expect(exist).toStrictEqual([
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
    },
  ]);
});

test("test gather with hooks", () => {
  const gatherDirPath = path.join("__tests__", "gather", "ignore-test-layout");
  const beforeFn = jest.fn((dirpath: string, layoutDirPath: string) => {});
  const beforeEachFn = jest.fn((dirpath: string) => {});
  const afterEachFn = jest.fn(
    (fileNode: FileNode | null, dirpath: string) => {}
  );
  const afterFn = jest.fn((fileNodes: FileNode[]) => {});
  const dirpath = path.join(gatherDirPath, "pages");
  const layoutDirPath = path.join(gatherDirPath, "layouts");
  gather({
    dirpath,
    layoutDirPath,
    hooks: {
      before: [beforeFn],
      beforeEach: [beforeEachFn],
      afterEach: [afterEachFn],
      after: [afterFn],
    },
  });

  expect(beforeFn.mock.calls).toHaveLength(1);
  expect(beforeFn.mock.calls[0]).toStrictEqual([dirpath, layoutDirPath]);

  expect(beforeEachFn.mock.calls).toHaveLength(2);
  expect(beforeEachFn.mock.calls[0][0]).toBe(path.join(layoutDirPath));
  expect(beforeEachFn.mock.calls[1][0]).toBe(path.join(dirpath, "index.tsx"));

  expect(afterEachFn.mock.calls).toHaveLength(2);
  expect(afterEachFn.mock.calls[0]).toStrictEqual([
    {
      name: "index.tsx",
      type: "file",
      path: path.join(layoutDirPath, "index.tsx"),
      layoutNode: true,
    },
    path.join(layoutDirPath, "index.tsx"),
  ]);
  expect(afterEachFn.mock.calls[1]).toStrictEqual([
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<SrcComponentsErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "SrcComponentsErrorBoundary",
          importPath: "./src/components/ErrorBoundary",
          isDefault: true,
        },
      ],
    },
    path.join(dirpath, "index.tsx"),
  ]);

  expect(afterFn.mock.calls).toHaveLength(1);
  expect(afterFn.mock.calls[0][0]).toStrictEqual([
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "pages", "index.tsx"),
      props: {
        routeProps: {
          errorElement: `${EVAL_STRING_SYMBOL}<SrcComponentsErrorBoundary />`,
        },
      },
      dependencies: [
        {
          name: "ErrorBoundary",
          asName: "SrcComponentsErrorBoundary",
          importPath: "./src/components/ErrorBoundary",
          isDefault: true,
        },
      ],
    },
    {
      name: "index.tsx",
      type: "file",
      path: path.join(gatherDirPath, "layouts", "index.tsx"),
      layoutNode: true,
    },
  ]);
});
