import path from "path";
import SagaRoute from "@/index";
import fs from "fs";

test("test routing that lazy all and has same import between route and pagefile.", () => {
  const sagaRoute = new SagaRoute({
    rootPath: __dirname,
    lazy: true,
    hooks: {
      print: {
        inject: {
          before(view) {
            view["prefix"] = "import React from 'react';";
          },
        },
      },
    },
  });
  sagaRoute.routing();
  const context = fs.readFileSync(
    path.join(__dirname, "src", "routes.tsx"),
    "utf-8"
  );
  expect(context).toMatchSnapshot();
});
