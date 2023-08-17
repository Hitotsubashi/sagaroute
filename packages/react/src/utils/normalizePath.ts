import path from 'path';

export function normalizePathSep(fpath: string) {
  return fpath.replaceAll(path.sep, '/');
}

export function adjustRelativePathPrefix(fpath: string) {
  if (fpath.startsWith('../.')) {
    return fpath.replace(/^\.\.\//, '');
  }
  return fpath.replace(/^\.\.\//, './');
}

export function pathRewriteExecute(fpath: string, pathRewrite?: [RegExp, string][]): string {
  let newPath = fpath;
  if (pathRewrite) {
    for (let i = 0; i < pathRewrite.length; i++) {
      const [reg, replaced] = pathRewrite[i];
      if (reg.test(newPath)) {
        newPath = newPath.replace(reg, replaced);
      }
    }
  }
  return newPath;
}

export default function normalizePath(fpath: string, pathRewrite?: [RegExp, string][]) {
  return pathRewriteExecute(adjustRelativePathPrefix(normalizePathSep(fpath)), pathRewrite);
}
