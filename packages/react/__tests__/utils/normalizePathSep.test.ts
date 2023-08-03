import { normalizePathSep } from "@/utils/normalizePath";
import path from "path";

test("test normalizePathSep", () => {
  expect(normalizePathSep(path.join("a", "b", "c.tsx"))).toEqual("a/b/c.tsx");
});
