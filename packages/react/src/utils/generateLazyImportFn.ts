import { FileNode } from "@/gather";
import { EVAL_STRING_SYMBOL } from "./symbol";
import { Imports, RouteObject } from "@/weave";
import generateImports from "./generateImports";
import mergeImports from "./mergeImports";
import transformRoutesToString from "./transformRoutesToString";
import normalizePath from "./normalizePath";
import generateImportName from "./generateImportName";

function generateImportLines(imports: Imports): string {
  const importLines: string[] = [];

  Object.entries(imports).forEach(([source, dependencies]) => {
    const notDefaultImport: string[] = [];
    let defaultImport: string = "";
    dependencies.forEach((dependency) => {
      if (dependency.isDefault) {
        // import x1 from 'xxx'
        if (dependency.name !== "*") {
          notDefaultImport.push(`default: ${dependency.asName}`);
          // import * as x1 from 'xxx'
        } else {
          importLines.push(
            `const ${dependency.asName} = await import("${source}");`
          );
        }
      } else {
        // import {x1} from 'xxx'
        if (dependency.name === dependency.asName) {
          notDefaultImport.push(dependency.name);
        } else {
          notDefaultImport.push(`${dependency.name} : ${dependency.asName}`);
        }
      }
    });
    const importElementString = [
      defaultImport,
      notDefaultImport.length ? `{${notDefaultImport.join(",")}}` : "",
    ]
      .filter((item) => Boolean(item))
      .join(",");
    if (importElementString) {
      importLines.push(
        `const ${importElementString}  = await import("${source}");`
      );
    }
  });
  return importLines.join("\n");
}

interface Option {
  pathRewrite?: [RegExp, string][];
  restRouteProps: Omit<
    RouteObject,
    "path" | "index" | "children" | "caseSensitive"
  >;
  dependencies: FileNode["dependencies"];
}

export default function generateLazyImportFn(
  componentPath: string,
  { restRouteProps, dependencies, pathRewrite }: Option
) {
  const asName = generateImportName(componentPath, "");
  const adjustedPath = normalizePath(componentPath, pathRewrite);
  const imports = generateImports(dependencies);
  mergeImports(imports, {
    [adjustedPath]: [
      {
        name: "default",
        asName,
        isDefault: false,
      },
    ],
  });
  const importLines = generateImportLines(imports);
  const returnObj: RouteObject = {
    Component: `${EVAL_STRING_SYMBOL}${asName}`,
    ...restRouteProps,
  };
  return `${EVAL_STRING_SYMBOL}async function() {
    ${importLines}
    return ${transformRoutesToString(returnObj)};
  }`;
}
