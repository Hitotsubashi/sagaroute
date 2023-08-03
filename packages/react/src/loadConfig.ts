import fs from 'fs';
import path from 'path';
import { RoutingOption } from '.';

declare const __webpack_require__: typeof require;
declare const __non_webpack_require__: typeof require;

export default function loadFileConfig(rootPath: string): RoutingOption | null {
  const configFilePaths = [
    path.resolve(rootPath, 'sagaroute.config.js'),
    path.resolve(rootPath, 'sagaroute.config.cjs'),
  ];
  for (let i = 0; i < configFilePaths.length; i++) {
    const configFilePath = configFilePaths[i];
    const configFileStat = fs.statSync(configFilePath, {
      throwIfNoEntry: false,
    });
    if (configFileStat && configFileStat.isFile()) {
      return readConfig(configFilePath);
    }
  }
  return null;
}

function readConfig(configFilePath: string) {
  if (typeof __webpack_require__ === 'function') {
    delete __non_webpack_require__.cache[configFilePath];
    return __non_webpack_require__(configFilePath);
  } else {
    delete require.cache[configFilePath];
    return require(configFilePath);
  }
}
