import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  editFile,
  getMTime,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
  defaultWaitTime,
  waitUntilFileChange,
} from '../utils';
import { TextEncoder } from 'util';
import * as assert from 'assert';

// @ts-ignore
suite('Test sagaroute.config', function () {
  // @ts-ignore
  this.timeout(defaultWaitTime * 6);

  const base = getWorkspaceFolderUri('config');
  const resultPath = path.join(base.fsPath, 'src', 'router', 'index.jsx');
  const encoder = new TextEncoder();
  const configPath = path.join(base.fsPath, 'sagaroute.config.cjs');

  test('test add sagaroute.config.cjs', async () => {
    // 重置result文件内容;
    await resetResultFile(resultPath);
    // 打开js文件激活Sagaroute
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(resultPath));
    await vscode.window.showTextDocument(doc);
    // 新增sagaroute.config文件
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(vscode.Uri.file(configPath), {
      contents: encoder.encode(
        `module.exports = {
    dirpath: "src/views",
    routeFilePath: "src/router/index.jsx"
}`,
      ),
    });
    await vscode.workspace.applyEdit(edit);
    // 等待至result文件变化
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, process.env.OS === 'Windows' ? 'e1window' : 'e1');
  });

  test('test modify error data in sagaroute.config', async () => {
    const previousMTime = await getMTime(resultPath);
    // 修改sagaroute.config文件，其中引入错误数据
    const edit = new vscode.WorkspaceEdit();
    editFile(
      configPath,
      `
  module.exports = {
    dirpath: "src/views",
    routeFilePath: 1,
    lazy: true
  }
  `,
      edit,
    );
    // 执行命令
    await wait();
    const afterMTime = await getMTime(resultPath);
    assert.equal(previousMTime, afterMTime);
  });

  test('test modify sagaroute.config', async () => {
    const edit = new vscode.WorkspaceEdit();
    editFile(
      configPath,
      `
  module.exports = {
    dirpath: "src/views",
    routeFilePath: "src/router/index.jsx",
    lazy: true
  }
  `,
      edit,
    );
    // 等待至result文件变化
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, process.env.OS === 'Windows' ? 'e2window' : 'e2');
  });

  test('test delete sagaroute.config', async () => {
    const previousMTime = await getMTime(resultPath);
    // 删除sagaroute.config文件
    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(vscode.Uri.file(configPath));
    await vscode.workspace.applyEdit(edit);
    // 执行命令
    await wait();
    const afterMTime = await getMTime(resultPath);
    assert.equal(previousMTime, afterMTime);
  });
});
