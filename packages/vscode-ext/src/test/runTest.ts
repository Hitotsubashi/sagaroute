import * as path from 'path';

import { runTests } from '@vscode/test-electron';

const runList = [
  {
    workspacePath: path.resolve(__dirname, '../..', 'test-fixtures', 'command.code-workspace'),
    extensionTestsPath: path.resolve(__dirname, './command/run.js'),
  },
  {
    workspacePath: path.resolve(__dirname, '../..', 'test-fixtures', 'file.code-workspace'),
    extensionTestsPath: path.resolve(__dirname, './file/run.js'),
  },
  {
    workspacePath: path.resolve(__dirname, '../..', 'test-fixtures', 'config.code-workspace'),
    extensionTestsPath: path.resolve(__dirname, './config/run.js'),
  },
  {
    workspacePath: path.resolve(__dirname, '../..', 'test-fixtures', 'boundary.code-workspace'),
    extensionTestsPath: path.resolve(__dirname, './boundary/run.js'),
  },
];

async function main() {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath = path.resolve(__dirname, '../../../');

  // Download VS Code, unzip it and run the integration test
  for (let i = 0; i < runList.length; i++) {
    const {
      // The path to the extension test script
      // Passed to --extensionTestsPath
      extensionTestsPath,
      // The path to the workspace file
      workspacePath,
    } = runList[i];
    try {
      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: [workspacePath, '--disable-extensions'],
      });
    } catch (err) {
      console.error('Failed to run tests');
      process.exit(1);
    }
  }
}

main().catch((err) => console.error(err));
