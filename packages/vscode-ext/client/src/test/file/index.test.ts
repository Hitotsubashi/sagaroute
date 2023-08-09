import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
} from '../command/index.test';

// @ts-ignore
suite('Test File Operate', () => {
  test('test add multiple files', async () => {
    const base = getWorkspaceFolderUri('file');
    const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
    // 重置result文件内容;
    await resetResultFile(resultPath);
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.routing');
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e1');
  });
});
