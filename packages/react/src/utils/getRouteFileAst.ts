import path from 'path';
import fs from 'fs';
import parseToAst from './parseToAst';

export function getRouteFilePath(filepath: string) {
  const { dir, ext, name } = path.parse(filepath);
  return dir + `${name}.route` + ext;
}

export function getRouteFileAstIfExist(routeFilePath: string) {
  const stats = fs.statSync(routeFilePath, { throwIfNoEntry: false });
  if (stats) {
    const content = fs.readFileSync(routeFilePath, 'utf-8');
    const isTsx = routeFilePath.endsWith('.tsx');
    const ast = parseToAst(content, isTsx, routeFilePath);
    return ast;
  }
  return null;
}
