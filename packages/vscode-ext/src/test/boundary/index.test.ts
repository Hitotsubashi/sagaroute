import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  defaultWaitTime,
  editFile,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
  waitUntilFileChange,
} from '../utils';

// @ts-ignore
suite('Test all kinds of boundary conditions', function () {
  // @ts-ignore
  this.timeout(defaultWaitTime * 30);

  const base = getWorkspaceFolderUri('boundary');
  const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
  const oneFilePath = path.join(base.fsPath, 'src', 'pages', 'index.tsx');
  const oneFileContent1 = `const App = () => {
    // @ts-ignore
    return <div>App1</div>;
};

export default App;`;
  const oneFileContent2 = `const App = () => {
  // @ts-ignore
  return <div>App</div>;
};

export default App;`;

  test('test with routeFile lost template variables', async () => {
    // 重置result文件内容;
    await resetResultFile(resultPath, 'error');
    // 打开js文件激活Sagaroute
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(resultPath));
    await vscode.window.showTextDocument(doc);
    await wait();
    // 打开js文件保存激活插件执行
    const edit = new vscode.WorkspaceEdit();
    await editFile(oneFilePath, oneFileContent1, edit);
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e1');
  });

  test('test with correct routeFile', async () => {
    await wait();
    // 重置result文件内容;
    await resetResultFile(resultPath, 'correct');
    // 打开js文件保存激活插件执行
    const edit = new vscode.WorkspaceEdit();
    await editFile(oneFilePath, oneFileContent2, edit);
    await waitUntilFileChange(resultPath);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e2');
  });
});
