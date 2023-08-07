import * as assert from 'assert';
import path from 'path';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import * as vscode from 'vscode';

const getWorkspaceFolderUri = (workspaceFolderName: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders!.find((folder) => {
    return folder.name === workspaceFolderName;
  });
  if (!workspaceFolder) {
    throw new Error(
      'Folder not found in workspace. Did you forget to add the test folder to test.code-workspace?',
    );
  }
  return workspaceFolder!.uri;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readFileAsync: (filePath: string, encoding: 'utf8') => Promise<string> = promisify(readFile);
const writeFileAsync: (filePath: string, data: string, encoding: 'utf8') => Promise<void> =
  promisify(writeFile);

// @ts-ignore
suite('Extension Test Suite', () => {
  test('normal', async () => {
    const base = getWorkspaceFolderUri('normal');
    const originPath = path.join(base.fsPath, 'src', 'routes.origin.tsx');
    const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
    const origin = await readFileAsync(originPath, 'utf8');
    await writeFileAsync(resultPath, origin, 'utf8');
    // 激活Sagaroute插件
    // await vscode.workspace.openTextDocument(path.join(base.fsPath, 'src', 'pages', 'index.tsx'));
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.routing');
    await wait(600);
    // 取出结果
    const doc = await vscode.workspace.openTextDocument(resultPath);
    const result = doc.getText();
    // 取出expected
    const expectedPath = path.join(base.fsPath, 'src', 'routes.expected.tsx');
    const expected = await readFileAsync(expectedPath, 'utf8');
    // 对比
    assert.equal(result, expected);
  });
});
