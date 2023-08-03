import fs from "fs";
import path from "path";
import getExportProps from "@/utils/getExportProps";
import hookCompose from "@/utils/hookCompose";
import isReactComponent from "@/utils/isReactComponent";
import parseToAst from "@/utils/parseToAst";
import { PartialRequired } from "./typings";

export type GatherHookBefore = (
  dirpath: string,
  layoutDirPath: string
) => void | null;
export type GatherHookBeforeEach = (
  fileNodePath: string
) => void | FileNode | null;
export type GatherHookAfterEach = (
  fileNode: FileNode,
  fileNodePath: string
) => void;
export type GatherHookAfter = (
  fileNodes: FileNode[],
  dirpath: string,
  layoutDirPath: string
) => void;

interface GatherOption {
  dirpath?: string;
  layoutDirPath?: string;
  relativeDirpath?: string;
  relativeLayoutDirPath?: string;
  pathRewrite?: [RegExp, string][];
  hooks?: {
    before?: GatherHookBefore[];
    beforeEach?: GatherHookBeforeEach[];
    afterEach?: GatherHookAfterEach[];
    after?: GatherHookAfter[];
  };
}

type InnerGatherOption = PartialRequired<
  GatherOption,
  "dirpath" | "layoutDirPath" | "relativeDirpath" | "relativeLayoutDirPath"
>;

export interface RouteOptions {
  layout?: boolean;
  [key: string]: any;
}

export interface FileNode {
  name: string;
  children?: FileNode[];
  type: "dir" | "file";
  layoutNode?: boolean;
  props?: {
    routeProps?: Record<string, any>;
    routeOptions?: RouteOptions;
  };
  path: string;
  dependencies?: Dependency[];
}

export interface Dependency {
  name: string;
  asName: string;
  importPath: string;
  isDefault: boolean;
}

function traverse(dirpath: string, option: InnerGatherOption): FileNode[] {
  const { pathRewrite, hooks, relativeDirpath } = option;
  const stats = fs.statSync(dirpath, { throwIfNoEntry: false });
  if (!stats) {
    throw new Error(`Cannot find folder with path "${dirpath}"`);
  }
  return fs.readdirSync(dirpath).reduce((pre, cur) => {
    const ext = path.extname(cur);
    const absPath = path.join(dirpath, cur);
    let fileNode: null | FileNode | undefined | void = hookCompose(
      hooks?.beforeEach,
      absPath
    );
    if (!fileNode && fileNode !== null) {
      if (
        [".", "_"].includes(cur.charAt(0)) &&
        cur.replace(ext, "") !== "_layout"
      ) {
        fileNode = null;
      } else {
        const curRelativeDirPath = path.join(relativeDirpath, cur);
        const itemStats = fs.statSync(absPath);
        if (itemStats.isDirectory()) {
          if (["components", "component", "utils", "util"].includes(cur)) {
            fileNode = null;
          } else {
            const children = traverse(absPath, {
              ...option,
              relativeDirpath: curRelativeDirPath,
            });
            if (children.length) {
              fileNode = normalize({
                name: cur,
                type: "dir",
                children,
                path: absPath,
              });
            } else {
              fileNode = null;
            }
          }
        }

        if (itemStats.isFile()) {
          if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(cur)) fileNode = null;
          else if (/\.d\.ts$/.test(cur)) fileNode = null;
          else if (![".tsx", ".jsx"].includes(ext)) fileNode = null;
          else {
            const fileContent = fs.readFileSync(absPath, "utf-8");
            const isTsx = ext === ".tsx";
            const ast = parseToAst(fileContent, isTsx);
            if (!isReactComponent(ast)) {
              fileNode = null;
            } else {
              const { props, dependencies } = getExportProps(
                ast,
                ["routeProps", "routeOptions"],
                absPath,
                {
                  pathRewrite,
                  relativePath: curRelativeDirPath,
                }
              );
              fileNode = normalize({
                name: cur,
                type: "file",
                props,
                dependencies,
                path: absPath,
              });
            }
          }
        }
      }
    }

    if (fileNode === null) {
      return pre;
    }
    if (fileNode) {
      hookCompose(hooks?.afterEach, fileNode, absPath);
      return pre.concat(fileNode);
    }

    return pre;
  }, [] as FileNode[]);
}

function normalize(fileNode: FileNode): FileNode {
  if (fileNode.props) {
    if (Object.keys(fileNode.props).length === 0) {
      delete fileNode.props;
    }
  }

  if (fileNode.dependencies?.length === 0) {
    delete fileNode.dependencies;
  }

  return fileNode;
}

export function getLayoutFileNodeIfExist(
  layoutDirPath: string,
  option: InnerGatherOption
): FileNode | null {
  let layoutPath = path.join(layoutDirPath, "index.tsx");
  let layoutFileNode: FileNode | void | null = hookCompose(
    option.hooks?.beforeEach,
    layoutDirPath
  );
  if (!layoutFileNode && layoutFileNode !== null) {
    let stats = fs.statSync(layoutPath, { throwIfNoEntry: false });
    let name = "index.tsx";
    let isTsx = true;
    if (!stats) {
      isTsx = false;
      name = "index.jsx";
      layoutPath = path.join(layoutDirPath, "index.jsx");
      stats = fs.statSync(layoutPath, { throwIfNoEntry: false });
    }
    if (stats?.isFile()) {
      const content = fs.readFileSync(layoutPath, "utf-8");
      const ast = parseToAst(content, isTsx);
      if (!isReactComponent(ast)) {
        layoutFileNode = null;
      } else {
        const { props, dependencies } = getExportProps(
          ast,
          ["routeProps", "routeOptions"],
          layoutPath,
          {
            pathRewrite: option.pathRewrite,
            relativePath: option.relativeLayoutDirPath,
          }
        );
        layoutFileNode = normalize({
          name,
          type: "file",
          layoutNode: true,
          props,
          dependencies,
          path: layoutPath,
        });
        hookCompose(option.hooks?.afterEach, layoutFileNode, layoutPath);
      }
    } else {
      layoutFileNode = null;
    }
  }
  return layoutFileNode;
}

function gather(option: GatherOption) {
  const {
    dirpath = path.join("src", "pages"),
    layoutDirPath = path.join("src", "layouts"),
    relativeDirpath = path.join("..", "src", "pages"),
    relativeLayoutDirPath = path.join("..", "src", "layouts"),
  } = option;
  if (hookCompose(option.hooks?.before, dirpath, layoutDirPath) !== null) {
    const layoutFileNode = getLayoutFileNodeIfExist(layoutDirPath, {
      ...option,
      dirpath,
      layoutDirPath,
      relativeDirpath,
      relativeLayoutDirPath,
    });
    const fileNodes: FileNode[] = traverse(dirpath, {
      ...option,
      dirpath,
      layoutDirPath,
      relativeDirpath,
      relativeLayoutDirPath,
    });
    if (layoutFileNode) {
      fileNodes.push(layoutFileNode);
    }
    hookCompose(option.hooks?.after, fileNodes, dirpath, layoutDirPath) ===
      null;
    return fileNodes;
  } else {
    return null;
  }
}

export default gather;
