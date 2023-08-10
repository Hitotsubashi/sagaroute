import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  editFile,
  getMTime,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
} from '../utils';
import { TextEncoder } from 'util';
import * as assert from 'assert';

// @ts-ignore
suite('Test all kinds of boundary conditions', () => {
  const base = getWorkspaceFolderUri('boundary');
  const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
  const oneFilePath = path.join(base.fsPath, 'src', 'pages', 'index.tsx');
  const oneFileContent = `const App = () => {
    // @ts-ignore
    return <div>App</div>;
};

export default App;`;

  test('test with routeFile lost template variables', async () => {
    // 重置result文件内容;
    await resetResultFile(resultPath, 'error');
    // 打开js文件保存激活插件执行
    const edit = new vscode.WorkspaceEdit();
    await editFile(oneFilePath, oneFileContent, edit);
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e1');
  });

  test('test with correct routeFile', async () => {
    await wait(300);
    // 重置result文件内容;
    await resetResultFile(resultPath, 'correct');
    // 打开js文件保存激活插件执行
    const edit = new vscode.WorkspaceEdit();
    await editFile(oneFilePath, oneFileContent, edit);
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e2');
  });
});
