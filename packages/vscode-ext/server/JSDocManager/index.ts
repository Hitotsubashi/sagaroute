/* eslint-disable @typescript-eslint/naming-convention */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { parse, ParserPlugin, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

const statAsync = promisify(fs.stat);
const readFileAync = promisify(fs.readFile);

async function getAst(fpath: string) {
  const fileContent = await readFileAync(fpath, 'utf-8');
  const { ext } = path.parse(fpath);
  const plugins: ParserPlugin[] = ['jsx'];
  if (ext === '.tsx') {
    plugins.push('typescript');
  }
  try {
    return parse(fileContent, {
      sourceType: 'module',
      plugins,
    });
  } catch (err) {
    console.error(`babel parse failed in path: [ ${fpath} ]`);
    console.error(err.message);
    return null;
  }
}

function findJSDoc(ast: ParseResult<t.File>): string | null {
  let componentName: string | undefined = undefined;
  let comments: t.Comment[] | null | undefined;
  traverse(ast, {
    ExportDefaultDeclaration(traversePath) {
      const { node } = traversePath;
      const { declaration } = node;
      if (t.isFunctionDeclaration(declaration)) {
        comments = node.leadingComments;
        traversePath.stop();
      } else if (t.isIdentifier(declaration)) {
        componentName = declaration.name;
        traversePath.stop();
      } else if (t.isClassDeclaration(declaration)) {
        comments = node.leadingComments;
        traversePath.stop();
      }
    },
  });
  if (componentName) {
    traverse(ast, {
      FunctionDeclaration(traversePath) {
        const { node } = traversePath;
        if (node.id?.name === componentName) {
          comments = node.leadingComments;
          traversePath.stop();
        }
      },
      ClassDeclaration(traversePath) {
        const { node } = traversePath;
        if (node.id?.name === componentName) {
          comments = node.leadingComments;
          traversePath.stop();
        }
      },
      VariableDeclaration(traversePath) {
        const { node } = traversePath;
        const { declarations } = node;
        if (
          declarations.some(
            (declarator) => t.isIdentifier(declarator.id) && declarator.id.name === componentName,
          )
        ) {
          comments = node.leadingComments;
          traversePath.stop();
        }
      },
    });
  }
  if (comments?.length) {
    return comments
      .map((comment) => {
        if (comment.type === 'CommentBlock') {
          return `/*${comment.value}*/`;
        } else {
          return `// ${comment.value}`;
        }
      })
      .join('\n');
  }
  return null;
}

class JSDocManager {
  jsdocRecord: Record<string, { mtime: number; content: string | null }> = {};

  async getJSDoc(fpath: string): Promise<null | string> {
    let stat: fs.Stats;
    try {
      stat = await statAsync(fpath);
    } catch (err) {
      console.error(`JSDocManager: Failed to get file stats for ${fpath}: ${err}`);
      return null;
    }
    if (this.jsdocRecord[fpath]) {
      if (stat!.mtimeMs === this.jsdocRecord[fpath].mtime) {
        return this.jsdocRecord[fpath].content;
      }
    }
    const ast = await getAst(fpath);
    if (!ast) {
      return null;
    }
    const jsdoc = findJSDoc(ast);
    this.jsdocRecord[fpath] = {
      mtime: stat.mtimeMs,
      content: jsdoc,
    };
    return jsdoc;
  }
}

let jsDocManager: JSDocManager;

export default function getJSDocManager() {
  if (!jsDocManager) {
    jsDocManager = new JSDocManager();
  }
  return jsDocManager;
}
