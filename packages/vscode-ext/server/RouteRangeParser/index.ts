import { Range } from 'vscode-languageserver/node';
import { parse, ParserPlugin, ParseResult } from '@babel/parser';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
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
  return parse(fileContent, {
    sourceType: 'module',
    plugins,
  });
}

interface ImportMember {
  importName: string;
  asName: string;
  isDefault: boolean;
}

function collectImportMember(ast: ParseResult<t.File>) {
  const importMembers: ImportMember[] = [];
  traverse(ast, {
    ImportDeclaration(traversePath) {
      const { node } = traversePath;
      if (['react-router-dom', 'react-router'].includes(node.source.value)) {
        const { specifiers } = node;
        specifiers.forEach((specifier) => {
          if (t.isImportSpecifier(specifier)) {
            importMembers.push({
              importName: t.isStringLiteral(specifier.imported)
                ? specifier.imported.value
                : specifier.imported.name,
              asName: specifier.local.name,
              isDefault: false,
            });
          } else if (t.isImportNamespaceSpecifier(specifier)) {
            importMembers.push({
              importName: '*',
              asName: specifier.local.name,
              isDefault: false,
            });
          } else {
            importMembers.push({
              importName: specifier.local.name,
              asName: specifier.local.name,
              isDefault: true,
            });
          }
        });
      }
    },
  });
  return importMembers;
}

function foundUseNavigateMember(importMembers: ImportMember[]) {
  return importMembers.filter(({ importName, asName, isDefault }) => {
    return importName === 'useNavigate' && isDefault;
  });
}

function parseNavigate(ast: ParseResult<t.File>) {}

class RouteRangeParser {
  rangeMap: Record<string, Range[]> = {};

  async parse(uri: string, content: string) {
    const ast = await getAst(uri);
    const importMembers = collectImportMember(ast);
  }
}
