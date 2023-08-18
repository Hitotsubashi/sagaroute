import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
  defaultWaitTime,
  waitUntilFileChange,
} from '../utils';

// @ts-ignore
suite('Test Command', function () {
  // @ts-ignore
  this.timeout(defaultWaitTime * 6);

  const base = getWorkspaceFolderUri('command');
  const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
  // @ts-ignore
  this.afterAll((done) => {
    vscode.workspace
      .getConfiguration('sagaroute')
      .update('working', false)
      .then(() => {
        done();
      });
  });

  test('test sagaroute.toggle', async () => {
    // 重置result文件内容
    await resetResultFile(resultPath);
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.toggle');
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath);
  });

  test('test sagaroute.routing', async () => {
    // 重置result文件内容
    await resetResultFile(resultPath);
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.routing');
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath);
  });
});
