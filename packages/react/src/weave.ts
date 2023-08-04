import { Dependency, FileNode } from '@/gather';
import path from 'path';
import { EVAL_STRING_SYMBOL } from '@/utils/symbol';
import hookCompose from '@/utils/hookCompose';
import generateLazyImportFn from '@/utils/generateLazyImportFn';
import normalizePath from '@/utils/normalizePath';
import generateImportName from '@/utils/generateImportName';
import mergeImports from '@/utils/mergeImports';
import generateImports from './utils/generateImports';
import { PartialRequired } from './typings';

export type WeaveHookBefore = (fileNodes: FileNode[]) => void | null;
export type WeaveHookBeforeEach = (
  fileNode: FileNode,
  parent: FileNodeParent,
) => void | { route: RouteObject; imports: Imports } | null;
export type WeaveHookAfterEach = (
  route: RouteObject,
  imports: Imports,
  fileNode: FileNode,
  parent: FileNodeParent,
) => void;
export type WeaveHookAfter = (
  routes: RouteObject[],
  imports: Imports,
  fileNodes: FileNode[],
) => void;

interface WeaveOption {
  lazy?: boolean | LazyFn;
  relativeDirpath?: string;
  relativeLayoutDirPath?: string;
  pathRewrite?: [RegExp, string][];
  hooks?: {
    before?: WeaveHookBefore[];
    beforeEach?: WeaveHookBeforeEach[];
    afterEach?: WeaveHookAfterEach[];
    after?: WeaveHookAfter[];
  };
}

type InnerWeaveOption = PartialRequired<WeaveOption, 'relativeDirpath' | 'relativeLayoutDirPath'>;

export type LazyFn = (fpath: string) => boolean;
export interface RouteObject {
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  children?: RouteObject[];
  element?: string;
  lazy?: string | LazyFn;
  [key: string]: any;
}

export type Imports = Record<string, Omit<Dependency, 'importPath'>[]>;

export interface FileNodeParent {
  path: string;
  layoutNode?: boolean;
}

function transformParamNameToParamPath(name: string | undefined) {
  if (name === undefined) return name;
  if (name === '[]') return '*';
  let match = name.match(/^\[([^$]*)\$\]$/);
  if (match) {
    return `:${match[1]}?`;
  }
  match = name.match(/^\[([^\]]*)\]$/);
  if (match) {
    return `:${match[1]}`;
  }
  return name;
}

function traverse(
  fileNodes: FileNode[],
  parent: FileNodeParent,
  option: InnerWeaveOption,
): { routes: RouteObject[]; imports: Imports } {
  const { lazy, relativeDirpath, relativeLayoutDirPath, pathRewrite, hooks } = option;
  const imports: Imports = {};
  const routes = fileNodes.reduce((pre, fileNode) => {
    let route: RouteObject | null;
    let routeImports: Imports = {};

    const hookResult = hookCompose(hooks?.beforeEach, fileNode, parent);

    if (!hookResult && hookResult !== null) {
      const { name, children, type, layoutNode, props, dependencies } = fileNode;
      const isFile = type === 'file';
      const currentPath = path.join(parent.path, name);
      // fileNode 类型为文件
      if (isFile) {
        const basename = name.replace(path.extname(name), '');
        let routePath: RouteObject['path'] = layoutNode ? '/' : basename;
        const index =
          props?.routeProps?.index !== undefined
            ? props.routeProps.index
            : !layoutNode && (parent.path !== '' || parent.layoutNode) && routePath === 'index'
            ? true
            : undefined;
        if (index) {
          routePath = undefined;
        } else if (routePath === 'index' && parent.path === '') {
          routePath = '/';
        } else if (routePath === '404') {
          routePath = '*';
        }
        routePath = transformParamNameToParamPath(routePath);
        const childrenResult = layoutNode
          ? traverse(children!, { path: '', layoutNode: true }, option)
          : undefined;
        route = {
          path: routePath,
          index,
          ...props?.routeProps,
          children: childrenResult?.routes,
        };

        const routeImportPath = path.join(
          layoutNode ? relativeLayoutDirPath : relativeDirpath,
          currentPath,
        );
        // routeProps.lazy有定义
        if (props?.routeProps?.lazy) {
          routeImports = generateImports(dependencies);
          // 全局lazy被定义
        } else if (typeof lazy === 'function' ? lazy(fileNode.path) : lazy) {
          const { path, index, children, caseSensitive, ...restRouteProps } = route;
          route = {
            path,
            index,
            children,
            caseSensitive,
            lazy:
              props?.routeProps?.lazy ||
              generateLazyImportFn(routeImportPath, {
                pathRewrite,
                restRouteProps,
                dependencies: fileNode.dependencies,
              }),
          };
          // lazy为false
        } else {
          const asName = generateImportName(routeImportPath, '');
          const importForCurrentRouteComponent: Imports = {
            [normalizePath(routeImportPath, pathRewrite)]: [
              {
                name: basename,
                asName,
                isDefault: true,
              },
            ],
          };
          routeImports = generateImports(dependencies);
          mergeImports(routeImports, importForCurrentRouteComponent);
          route = {
            ...route,
            element: `${EVAL_STRING_SYMBOL}<${asName}/>`,
          };
        }
        if (childrenResult?.imports) {
          mergeImports(routeImports, childrenResult.imports);
        }
        // fileNode 类型为文件夹
      } else {
        const _layoutFileNode = children!.find(
          ({ name, type }) => type === 'file' && name.replace(path.extname(name), '') === '_layout',
        );
        route = {
          path: transformParamNameToParamPath(name),
        };
        // 文件里的文件夹中包含_layout
        if (_layoutFileNode) {
          const childrenResult = traverse(
            children!.filter((item) => item !== _layoutFileNode),
            { path: currentPath },
            option,
          );
          route = {
            ...route,
            children: childrenResult.routes,
            ..._layoutFileNode.props?.routeProps,
          };
          const routeImportPath = path.join(relativeDirpath, currentPath, _layoutFileNode.name);
          // routeProps.lazy有定义
          if (_layoutFileNode.props?.routeProps?.lazy) {
            routeImports = generateImports(dependencies);
            // 全局lazy有定义
          } else if (typeof lazy === 'function' ? lazy(_layoutFileNode.path) : lazy) {
            const { path, index, children, caseSensitive, ...restRouteProps } = route;
            route = {
              path,
              index,
              children,
              caseSensitive,
              lazy:
                _layoutFileNode.props?.routeProps?.lazy ||
                generateLazyImportFn(routeImportPath, {
                  pathRewrite,
                  restRouteProps,
                  dependencies: _layoutFileNode.dependencies,
                }),
            };
            // lazy为false
          } else {
            const asName = generateImportName(routeImportPath, '');
            const basename = _layoutFileNode.name.replace(path.extname(_layoutFileNode.name), '');
            const importForCurrentRouteComponent: Imports = {
              [normalizePath(routeImportPath, pathRewrite)]: [
                {
                  name: basename,
                  asName,
                  isDefault: true,
                },
              ],
            };
            routeImports = generateImports(dependencies);
            mergeImports(routeImports, importForCurrentRouteComponent);
            route = {
              ...route,
              element: `${EVAL_STRING_SYMBOL}<${asName}/>`,
            };
          }
          if (childrenResult.imports) {
            mergeImports(routeImports, childrenResult.imports);
          }
          // 文件里的文件夹中不包含_layout
        } else {
          const childrenResult = traverse(children!, { path: currentPath }, option);
          route = {
            ...route,
            children: childrenResult.routes,
          };
          if (childrenResult.imports) {
            mergeImports(routeImports, childrenResult.imports);
          }
        }
      }
      route = normalize(route);
    } else if (hookResult === null) {
      route = null;
    } else {
      ({ route, imports: routeImports } = hookResult);
    }
    if (route === null) {
      return pre;
    }
    if (route) {
      hookCompose(hooks?.afterEach, route, routeImports, fileNode, parent);
      mergeImports(imports, routeImports);
      return pre.concat(route);
    }
    return pre;
  }, [] as RouteObject[]);
  return { routes, imports };
}

function normalize(route: RouteObject): RouteObject {
  for (const key in route) {
    if (route[key] === undefined) {
      delete route[key];
    }
  }
  if (Array.isArray(route.children)) {
    if (!route.children.length) {
      delete route.children;
    }
  }
  return route;
}

export default function weave(fileNodes: FileNode[], option: WeaveOption) {
  const {
    relativeDirpath = path.join('..', 'src', 'pages'),
    relativeLayoutDirPath = path.join('..', 'src', 'layouts'),
  } = option;
  if (hookCompose(option.hooks?.before, fileNodes) !== null) {
    const layoutFileNode = fileNodes.find(({ layoutNode }) => layoutNode);
    let ultimateFileNodes: FileNode[] = fileNodes;
    if (layoutFileNode) {
      const unlayoutFileNodes = fileNodes.filter(
        ({ name, props, layoutNode, children }) =>
          !layoutNode &&
          ((name.replace(path.extname(name), '') === '404' &&
            props?.routeOptions?.layout !== true) ||
            props?.routeOptions?.layout === false ||
            children?.some(
              ({ type, name, props }) =>
                type === 'file' &&
                name.replace(path.extname(name), '') === '_layout' &&
                props?.routeOptions?.layout === false,
            )),
      );

      ultimateFileNodes = [
        {
          ...layoutFileNode,
          children: fileNodes.filter(
            (item) => item !== layoutFileNode && !unlayoutFileNodes.includes(item),
          ),
        },
        ...unlayoutFileNodes,
      ];
    }
    const { routes, imports } = traverse(
      ultimateFileNodes,
      { path: '' },
      { ...option, relativeDirpath, relativeLayoutDirPath },
    );
    hookCompose(option?.hooks?.after, routes, imports, fileNodes);
    return { routes, imports };
  } else {
    return null;
  }
}
