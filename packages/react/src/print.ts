import path from 'path';
import fs from 'fs';
import {
  INJECT_SYMBOL_PREFIX_REGEXP,
  TEMPLATE_RENDER_IMPORTS_SYMBOL,
  TEMPLATE_RENDER_ROUTE_SYMBOL,
} from '@/utils/symbol';
import { Imports, RouteObject } from '@/weave';
import { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import Mustache from 'mustache';
import hookCompose from '@/utils/hookCompose';
import parseToAst from '@/utils/parseToAst';
import transformRoutesToString from './utils/transformRoutesToString';

export type PrintHookBeforeParse = (routeFilePath: string) => void | string | null;
export type PrintHookAfterParse = (template: string, routeFilePath: string) => void;
export type PrintHookBeforeInject = (
  view: Record<string, any>,
  template: string,
  routes: RouteObject[],
) => void | string | null;
export type PrintHookAfterInject = (
  content: string,
  view: Record<string, any>,
  template: string,
) => void;
export type PrintHookBeforeWrite = (renderedContent: string, routeFilePath: string) => void | null;
export type PrintHookAfterWrite = (routeFilePath: string) => void;

interface PrintOption {
  routeFilePath?: string;
  onWarning?: (message: string) => void;
  hooks?: {
    parse?: {
      before?: PrintHookBeforeParse[];
      after?: PrintHookAfterParse[];
    };
    inject?: {
      before?: PrintHookBeforeInject[];
      after?: PrintHookAfterInject[];
    };
    write?: {
      before?: PrintHookBeforeWrite[];
      after?: PrintHookAfterWrite[];
    };
  };
}

function getRouteFileContent(routeFilePath: string): string {
  const stats = fs.statSync(routeFilePath, { throwIfNoEntry: false });
  if (!stats || !stats.isFile()) {
    throw new Error(`Could not find the file with path ${routeFilePath}`);
  }
  return fs.readFileSync(routeFilePath, 'utf-8');
}

const IMPORT_DECLARATIONS_COMMENT = 'injected by sagaroute';
export const IMPORT_DECLARATIONS_COMMENT_START = `${IMPORT_DECLARATIONS_COMMENT}: start`;
export const IMPORT_DECLARATIONS_COMMENT_END = `${IMPORT_DECLARATIONS_COMMENT}: end`;

function removeInjectedContent(content: string) {
  return content.replace(
    /\/\* injected by sagaroute: start \*\/.*\/\* injected by sagaroute: end \*\//gs,
    '',
  );
}

function parseStickyInjectCommentToPlaceholder(
  ast: ParseResult<t.File>,
  handledInjectVariables: string[],
) {
  function getInjectedVariable(node: t.Node) {
    const startLine = node.loc?.start.line;
    const { leadingComments } = node;
    const matchObj = leadingComments
      ?.find(({ loc }) => loc?.start && loc.start.line + 1 === startLine)
      ?.value.match(INJECT_SYMBOL_PREFIX_REGEXP);
    return matchObj?.[1]?.trim();
  }

  traverse(ast, {
    VariableDeclaration({ node }) {
      const startLine = node.loc?.start.line;
      const varName = getInjectedVariable(node);
      if (varName) {
        for (let i = 0; i < node.declarations.length; i++) {
          const declarator = node.declarations[i];
          if (
            t.isVariableDeclarator(declarator) &&
            declarator.loc &&
            /**
             * 防止一条声明语句里被拆分成多行的情况，如：
             * let code=x,
             *  code1=x1
             */
            declarator.loc.start.line === startLine
          ) {
            handledInjectVariables.push(varName);
            declarator.init = t.identifier(`{{{${varName}}}}`);
          }
        }
      }
    },
    ExportNamedDeclaration({ node }) {
      const startLine = node.loc?.start.line;
      const varName = getInjectedVariable(node);
      if (varName && t.isVariableDeclaration(node.declaration)) {
        for (let i = 0; i < node.declaration.declarations.length; i++) {
          const declarator = node.declaration.declarations[i];
          if (
            t.isVariableDeclarator(declarator) &&
            declarator.loc &&
            /**
             * 防止一条声明语句里被拆分成多行的情况，如：
             * let code=x,
             *  code1=x1
             */
            declarator.loc.start.line === startLine
          ) {
            handledInjectVariables.push(varName);
            declarator.init = t.identifier(`{{{${varName}}}}`);
          }
        }
      }
    },
    ReturnStatement({ node }) {
      const varName = getInjectedVariable(node);
      if (varName) {
        handledInjectVariables.push(varName);
        node.argument = t.identifier(`{{{${varName}}}}`);
      }
    },
    ExportDefaultDeclaration({ node }) {
      const varName = getInjectedVariable(node);
      if (varName) {
        handledInjectVariables.push(varName);
        node.declaration = t.identifier(`{{{${varName}}}}`);
      }
    },
  });
}

function parseEmptyInjectCommentToPlaceholder(content: string, handledInjectVariables: string[]) {
  const injectedVariables = new Set(handledInjectVariables);
  function replacer(match: string, p1: string) {
    const matchObj = p1.match(INJECT_SYMBOL_PREFIX_REGEXP);
    if (matchObj) {
      const varName = matchObj[1]?.trim();
      if (!handledInjectVariables.includes(varName)) {
        injectedVariables.add(varName);
        return [
          match,
          `/* ${IMPORT_DECLARATIONS_COMMENT_START} */`,
          `{{{${varName}}}}`,
          `/* ${IMPORT_DECLARATIONS_COMMENT_END} */`,
        ].join('\n');
      }
    }
    return match;
  }

  let modifiedContent = content.replace(/\/\/(.*)/g, replacer);
  modifiedContent = modifiedContent.replace(/\/\*(.*)\*\//g, replacer);
  return {
    template: modifiedContent,
    injectedVariables: Array.from(injectedVariables),
  };
}

function generateRenderTemplateFromContent(content: string, routeFilePath: string) {
  const handledInjectVariables: string[] = [];
  const modifiedContent = removeInjectedContent(content);
  const ast = parseToAst(
    modifiedContent,
    ['.ts', '.tsx'].includes(path.extname(routeFilePath)),
    routeFilePath,
  );
  const existedImportNames = collectExistedImportNames(ast);
  parseStickyInjectCommentToPlaceholder(ast, handledInjectVariables);
  let { code: template } = generate(ast);
  let injectedVariables: string[];
  // eslint-disable-next-line prefer-const
  ({ template, injectedVariables } = parseEmptyInjectCommentToPlaceholder(
    template,
    handledInjectVariables,
  ));
  return { template, existedImportNames, injectedVariables };
}

function collectExistedImportNames(ast: ParseResult<t.File>) {
  const existedImportNames: string[] = [];
  traverse(ast, {
    ImportDeclaration({ node }) {
      node.specifiers.forEach((specifier) => {
        if (
          t.isImportDefaultSpecifier(specifier) ||
          t.isImportNamespaceSpecifier(specifier) ||
          t.isImportSpecifier(specifier)
        ) {
          existedImportNames.push(specifier.local.name);
        }
      });
    },
  });
  return existedImportNames;
}

function transformImportsToString(imports: Imports, existedImportNames: string[]) {
  const importLines: string[] = [];

  Object.entries(imports).forEach(([source, dependencies]) => {
    const notDefaultImport: string[] = [];
    let defaultImport: string = '';
    dependencies
      .filter(({ asName }) => !existedImportNames.includes(asName))
      .forEach((dependency) => {
        if (dependency.isDefault) {
          // import x1 from 'xxx'
          if (dependency.name !== '*') {
            defaultImport = dependency.asName;
            // import * as x1 from 'xxx'
          } else {
            importLines.push(`import * as ${dependency.asName} from "${source}";`);
          }
        } else {
          // import {x1} from 'xxx'
          if (dependency.name === dependency.asName) {
            notDefaultImport.push(dependency.name);
          } else {
            notDefaultImport.push(`${dependency.name} as ${dependency.asName}`);
          }
        }
      });
    const importElementString = [
      defaultImport,
      notDefaultImport.length ? `{${notDefaultImport.join(',')}}` : '',
    ]
      .filter((item) => Boolean(item))
      .join(',');
    if (importElementString) {
      importLines.push(`import ${importElementString} from "${source}";`);
    }
  });
  return importLines.join('\n');
}

function diffVariableBetweenViewAndTemplate(
  viewVariable: string[],
  templateVariable: string[],
  onWarning: NonNullable<PrintOption['onWarning']>,
  routeFilePath: string,
) {
  const variablesOnlyInView = viewVariable.filter((item) => !templateVariable.includes(item));
  const variablesOnlyInTemplate = templateVariable.filter((item) => !viewVariable.includes(item));
  if (variablesOnlyInView.length) {
    onWarning(
      `The RoutingTemplateFile<${routeFilePath}> has no variables such as ${variablesOnlyInView
        .map((item) => `[${item}]`)
        .join(',')} which are needed in view.`,
    );
  }
  if (variablesOnlyInTemplate.length) {
    onWarning(
      `The view of stage<print.inject.before> has no variables such as ${variablesOnlyInTemplate
        .map((item) => `[${item}]`)
        .join(',')} which are needed in template.`,
    );
  }
}

export default function print(routes: RouteObject[], imports: Imports, option?: PrintOption) {
  const { routeFilePath = path.join('src', 'route.ts'), hooks, onWarning } = option ?? {};
  let renderTemplate = hookCompose(hooks?.parse?.before, routeFilePath);
  if (renderTemplate === null) return;
  let existedImportNames: string[] = [];
  let injectedVariables: undefined | string[];
  if (!renderTemplate) {
    const content = getRouteFileContent(routeFilePath);
    ({
      template: renderTemplate,
      existedImportNames,
      injectedVariables,
    } = generateRenderTemplateFromContent(content, routeFilePath));
  }
  hookCompose(hooks?.parse?.after, renderTemplate, routeFilePath);
  const view: Record<string, any> = {
    [TEMPLATE_RENDER_ROUTE_SYMBOL]: transformRoutesToString(routes),
    [TEMPLATE_RENDER_IMPORTS_SYMBOL]: transformImportsToString(imports, existedImportNames),
  };
  let renderedContent = hookCompose(hooks?.inject?.before, view, renderTemplate, routes);
  if (renderedContent === null) return;
  // 如果用户在parse.before中返回了template，此时injectedVariables为undefined
  if (injectedVariables && onWarning) {
    diffVariableBetweenViewAndTemplate(
      Object.keys(view),
      injectedVariables,
      onWarning,
      routeFilePath,
    );
  }
  if (!renderedContent) {
    renderedContent = Mustache.render(renderTemplate, view);
    renderedContent = renderedContent.replace(
      /\/\* injected by sagaroute: start \*\/\s*\/\* injected by sagaroute: end \*\/\s/gs,
      '',
    );
  }
  hookCompose(hooks?.inject?.after, renderedContent, view, renderTemplate);
  if (hookCompose(hooks?.write?.before, renderedContent, routeFilePath) !== null) {
    fs.writeFileSync(routeFilePath, renderedContent, {
      flag: 'w+',
    });
    hookCompose(hooks?.write?.after, routeFilePath);
  }
}
