import { ParseResult } from "@babel/parser";
import traverse from "@babel/traverse";
import { File } from "@babel/types";

export default function isReactComponent(ast: ParseResult<File>) {
  let hasJSXElement = false;
  traverse(ast, {
    JSXElement(path: any) {
      hasJSXElement = true;
      path.stop();
    },
    JSXFragment(path: any) {
      hasJSXElement = true;
      path.stop();
    },
  });
  return hasJSXElement;
}
