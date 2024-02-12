import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { File, ObjectExpression } from '@babel/types';
import { transformFromAstSync } from '@babel/core';
import path from 'path';
import { EVAL_STRING_SYMBOL, htmlTagNames, svgTagNames } from './symbol';
import normalizePath from './normalizePath';
import { Dependency, FileNode } from '@/gather';
import generateImportName from './generateImportName';

interface Option {
  pathRewrite?: [RegExp, string][];
  relativePath: string;
}

export default function getExportPropsAndDependencies(
  ast: ParseResult<File>,
  propNames: string[],
  filepath: string,
  { pathRewrite, relativePath }: Option,
): { props: Record<string, any>; dependencies: FileNode['dependencies'] } {
  const props: Record<string, any> = {};
  const dependencies: Dependency[] = [];

  propNames.forEach((propName) => {
    const result = findSpecifiedProp(ast, propName, filepath, {
      pathRewrite,
      relativePath,
    });
    if (result) {
      props[propName] = result.prop;
      dependencies.push(...result.dependencies);
    }
  });

  return { props, dependencies };
}

function findSpecifiedProp(
  ast: ParseResult<babel.types.File>,
  propName: string,
  filepath: string,
  { pathRewrite, relativePath }: Option,
) {
  let propNode;
  traverse(ast, {
    ExportNamedDeclaration(traversePath) {
      const { node } = traversePath;
      const { declaration } = node;
      if (t.isVariableDeclaration(declaration)) {
        const { declarations } = declaration;
        for (let i = 0; i < declarations.length; i++) {
          const { id, init } = declarations[i];
          if (t.isIdentifier(id) && id.name === propName) {
            propNode = init;
          }
        }
      }
    },
  });
  const dependencies: Dependency[] = [];
  if (t.isObjectExpression(propNode)) {
    adjustSourceInImportExpression(propNode, {
      pathRewrite,
      relativePath,
    });
    transformIdentifierToLiteral(propNode, ast, filepath, dependencies, {
      relativePath,
      pathRewrite,
    });
    transformSpecialElementToLiteral(propNode);
    transformJSXToLiteral(propNode, ast, filepath, dependencies, {
      relativePath,
      pathRewrite,
    });
    const prop = eval(`(${generate(propNode).code})`);
    return { prop, dependencies };
  }
  return null;
}

function adjustSourceInImportExpression(
  propNode: ObjectExpression,
  { pathRewrite, relativePath }: Option,
) {
  const ProgramNode = {
    type: 'Program' as const,
    sourceType: 'script' as const,
    directives: [],
    sourceFile: '',
    body: [t.variableDeclaration('const', [t.variableDeclarator(t.identifier('a'), propNode)])],
  };
  traverse(ProgramNode, {
    // import('xxx')语句
    CallExpression(traversePath) {
      const { node } = traversePath;
      if (t.isImport(node.callee) && t.isStringLiteral(node.arguments[0])) {
        const { result: adjustedPath } = adjustPath(node.arguments[0].value, relativePath);
        node.arguments[0] = t.stringLiteral(normalizePath(adjustedPath, pathRewrite));
      }
    },
  });
}

function adjustPath(origin: string, context: string) {
  const absolute = isPathAbsolute(origin);
  const result = absolute ? origin : path.join(path.dirname(context), origin);
  return { absolute, result };
}

function transformIdentifierToLiteral(
  propNode: ObjectExpression,
  ast: ParseResult<babel.types.File>,
  filepath: string,
  dependencies: Dependency[],
  { relativePath, pathRewrite }: Option,
) {
  const { properties } = propNode;
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    // {routeProps: routeProps} 或者 {routeProps} 情况
    if (t.isProperty(property) && t.isIdentifier(property.value)) {
      const variableName = property.value.name;
      if (variableName === 'undefined') {
        property.value = t.stringLiteral(`${EVAL_STRING_SYMBOL}${variableName}`);
        continue;
      }
      let dependency: Dependency | undefined | null = dependencies.find(
        ({ name }) => name === variableName,
      );
      if (dependency) {
        property.value = t.stringLiteral(`${EVAL_STRING_SYMBOL}${dependency.asName}`);
        continue;
      } else {
        dependency = getDependencyByName(variableName, ast, {
          relativePath,
          pathRewrite,
        });
      }
      if (dependency) {
        property.value = t.stringLiteral(`${EVAL_STRING_SYMBOL}${dependency!.asName}`);
        dependencies.push(dependency);
      } else {
        throw new Error(
          `The variable named "${variableName}" cannot be found in the file with the path "file://${filepath}"`,
        );
      }
    }
  }
}

function transformExpressionToRawString(node: t.Expression) {
  const ProgramNode = {
    type: 'Program' as const,
    sourceType: 'script' as const,
    directives: [],
    sourceFile: '',
    body: [t.variableDeclaration('const', [t.variableDeclarator(t.identifier('a'), node)])],
  };
  return transformFromAstSync(ProgramNode)?.code?.match(/^const a = (.*);$/s)?.[1];
}

function transformSpecialElementToLiteral(propNode: ObjectExpression) {
  const { properties } = propNode;
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (t.isObjectProperty(property)) {
      if (
        // {xx:()=>{}}或者{xx:function(){}}
        t.isArrowFunctionExpression(property.value) ||
        t.isFunctionExpression(property.value) ||
        // {xx: []}
        t.isArrayExpression(property.value) ||
        // {xx:Symbol('x')}
        (t.isCallExpression(property.value) &&
          t.isIdentifier(property.value.callee) &&
          property.value.callee.name === 'Symbol') ||
        // {xx:{...}}
        t.isObjectExpression(property.value) ||
        // {xx: new Object()}
        t.isNewExpression(property.value)
      ) {
        const rawString = transformExpressionToRawString(property.value);
        property.value = t.stringLiteral(`${EVAL_STRING_SYMBOL}${rawString}`);
      }
    }
  }
}

/**
 * 不支持JSXNamespacedName写法，如<my-namespace:MyComponent />
 */
function transformJSXToLiteral(
  propNode: ObjectExpression,
  ast: ParseResult<babel.types.File>,
  filepath: string,
  dependencies: Dependency[],
  { relativePath, pathRewrite }: Option,
) {
  const { properties } = propNode;
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (t.isProperty(property)) {
      if (t.isJSXElement(property.value) || t.isJSXFragment(property.value)) {
        transformSingleJSX(property.value, ast, filepath, dependencies, {
          relativePath,
          pathRewrite,
        });
      }
      if (t.isJSXElement(property.value) || t.isJSXFragment(property.value)) {
        property.value = t.stringLiteral(
          `${EVAL_STRING_SYMBOL}${transformExpressionToRawString(property.value)}`,
        );
      }
    }
  }
  return dependencies;
}

/**
 * 不支持<Comp></Comp>中的属性含非jsx的闭包
 */
function transformSingleJSX(
  element: t.JSXElement | t.JSXFragment,
  ast: ParseResult<babel.types.File>,
  filepath: string,
  dependencies: Dependency[],
  { relativePath, pathRewrite }: Option,
) {
  if (t.isJSXElement(element)) {
    let JSXOpeningElementName = element.openingElement.name as
      | t.JSXIdentifier
      | t.JSXMemberExpression;
    let JSXClosingElementName = element.closingElement?.name as
      | t.JSXIdentifier
      | t.JSXMemberExpression
      | null;
    let jsxIdentifierOfOpen: t.JSXIdentifier;
    let jsxIdentifierOfClose: t.JSXIdentifier | null;
    // 解析<xx.xx1 />写法
    if (t.isJSXMemberExpression(JSXOpeningElementName)) {
      while (t.isJSXMemberExpression(JSXOpeningElementName)) {
        JSXOpeningElementName = JSXOpeningElementName.object;
      }
    }
    // eslint-disable-next-line prefer-const
    jsxIdentifierOfOpen = JSXOpeningElementName;
    if (t.isJSXMemberExpression(JSXClosingElementName)) {
      while (t.isJSXMemberExpression(JSXClosingElementName)) {
        JSXClosingElementName = JSXClosingElementName.object;
      }
    }
    // eslint-disable-next-line prefer-const
    jsxIdentifierOfClose = JSXClosingElementName;
    if (
      !htmlTagNames.includes(jsxIdentifierOfOpen.name) &&
      !svgTagNames.includes(jsxIdentifierOfOpen.name)
    ) {
      let dependency = dependencies.find(({ name }) => name === jsxIdentifierOfOpen.name) ?? null;
      if (dependency) {
        jsxIdentifierOfOpen.name = dependency.asName;
        if (jsxIdentifierOfClose) {
          jsxIdentifierOfClose.name = dependency.asName;
        }
      } else {
        dependency = getDependencyByName(jsxIdentifierOfOpen.name, ast, {
          relativePath,
          pathRewrite,
        });
        if (dependency === null) {
          // 不报错：避免HTML中的customElements情况
          // throw new Error(
          //   `The JSXComponent named "${jsxIdentifierOfOpen.name}" cannot be found in the file with the path "file://${filepath}"`
          // );
        } else {
          jsxIdentifierOfOpen.name = dependency.asName;
          if (jsxIdentifierOfClose) {
            jsxIdentifierOfClose.name = dependency.asName;
          }
          dependencies.push(dependency);
        }
      }
    }
    element.openingElement.attributes
      .filter(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXExpressionContainer(attr.value) &&
          t.isJSXElement(attr.value.expression),
      )
      .forEach((attr) =>
        transformSingleJSX(
          ((attr as t.JSXAttribute).value as t.JSXExpressionContainer).expression as t.JSXElement,
          ast,
          filepath,
          dependencies,
          {
            relativePath,
            pathRewrite,
          },
        ),
      );
  }
  element.children
    .filter((child) => t.isJSXElement(child) || t.isJSXFragment(child))
    .forEach((child) =>
      transformSingleJSX(child as t.JSXElement | t.JSXFragment, ast, filepath, dependencies, {
        relativePath,
        pathRewrite,
      }),
    );
}

function isPathAbsolute(filepath: string) {
  return !filepath.startsWith('.');
}

function getDependencyByName(
  name: string,
  ast: ParseResult<babel.types.File>,
  { relativePath, pathRewrite }: Option,
): Dependency | null {
  let dependency: Dependency | null = null;
  traverse(ast, {
    ImportDeclaration(traversePath) {
      const { node } = traversePath;
      for (let i = 0; i < node.specifiers.length; i++) {
        const specifier = node.specifiers[i];
        if (specifier.local.name === name) {
          const { result: importPath, absolute: importPathAbsolute } = adjustPath(
            node.source.value,
            relativePath,
          );
          const normalizedImportPath = importPathAbsolute
            ? importPath
            : normalizePath(importPath, pathRewrite);
          // import x1 from 'xxx'
          if (t.isImportDefaultSpecifier(specifier)) {
            dependency = {
              name,
              asName: generateImportName(importPath, ''),
              importPath: normalizedImportPath,
              isDefault: true,
            };
            /**
             *  import {x1 as x2} from 'xxx'
             *  import {x1} from 'xxx'
             */
          } else if (t.isImportSpecifier(specifier)) {
            const originName = t.isStringLiteral(specifier.imported)
              ? specifier.imported.value
              : specifier.imported.name;
            dependency = {
              name: originName,
              asName: generateImportName(importPath, originName),
              importPath: normalizedImportPath,
              isDefault: false,
            };
            // import * as x1 from 'xxx'
          } else if (t.isImportNamespaceSpecifier(specifier)) {
            dependency = {
              name: '*',
              asName: generateImportName(importPath, ''),
              importPath: normalizedImportPath,
              isDefault: true,
            };
          }

          traversePath.stop();
          break;
        }
      }
    },
  });
  return dependency;
}
