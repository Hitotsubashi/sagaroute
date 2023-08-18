import path from 'path';
import * as vscode from 'vscode';
import {
  compareWithExpectedFile,
  defaultWaitTime,
  editFile,
  getWorkspaceFolderUri,
  resetResultFile,
  wait,
} from '../utils';

// @ts-ignore
suite('Test all kinds of boundary conditions', function () {
  // @ts-ignore
  this.timeout(defaultWaitTime * 5);

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
    await wait();
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(
      resultPath,
      process.env.OS === 'windows-latest' ? 'e1window' : 'e1',
    );
  });

  test('test with correct routeFile', async () => {
    await wait();
    // 重置result文件内容;
    await resetResultFile(resultPath, 'correct');
    // 打开js文件保存激活插件执行
    const edit = new vscode.WorkspaceEdit();
    await editFile(oneFilePath, oneFileContent, edit);
    await wait();
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(
      resultPath,
      process.env.OS === 'windows-latest' ? 'e2window' : 'e2',
    );
  });
});
