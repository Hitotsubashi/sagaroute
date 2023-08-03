import { RouteObject } from "@/weave";
import { EVAL_STRING_SYMBOL, EVAL_STRING_SYMBOL_REGEXP } from "./symbol";
import { isObject } from "./mergeOption";

function replacer(key: string, value: any) {
  if (isObject(value) && "children" in value) {
    const { children, ...rest } = value;
    rest["children"] = children;
    return rest;
  }
  if (typeof value === "string" && value.startsWith(EVAL_STRING_SYMBOL)) {
    return value + EVAL_STRING_SYMBOL;
  }
  return value;
}

export default function transformRoutesToString(
  routes: RouteObject[] | RouteObject
) {
  return JSON.stringify(routes, replacer, 2)
    .replace(EVAL_STRING_SYMBOL_REGEXP, (global, m1) => {
      return m1.replace(/\\\"/g, '"');
    })
    .replace(/\\r\\n/g, "\r\n")
    .replace(/\\n/g, "\r\n");
}
