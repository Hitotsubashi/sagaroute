import path from 'path';

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function generateImportName(fpath: string, varName: string): string {
  const { name, dir } = path.parse(fpath);
  let upper = true;
  let importName = '';
  let basepath = path.join(dir, name);
  for (let i = 0; i < basepath.length; i++) {
    // if (basepath[i] === ".") {
    //   upper = false;
    // } else if ([path.sep, "-", "_", "[", "]", "$"].includes(basepath[i])) {
    if (!/[A-Za-z0-9]/.test(basepath[i])) {
      upper = true;
    } else {
      if (upper) {
        importName += basepath[i].toUpperCase();
        upper = false;
      } else {
        importName += basepath[i];
      }
    }
  }
  if (!/[_A-Za-z]/.test(importName[0])) {
    importName = '_' + importName;
  }
  if (name === '[]') {
    importName += '_';
  }
  return importName + capitalize(varName);
}
