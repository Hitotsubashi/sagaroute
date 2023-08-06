import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../');

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index.js');

    // The path to the workspace file
    const workspacePath = path.resolve('test-fixtures', 'test.code-workspace');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath]
        .concat(['--skip-welcome'])
        .concat(['--disable-extensions'])
        .concat(['--skip-release-notes'])
        .concat(['--enable-proposed-api']),
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main().catch((err) => console.error(err));
