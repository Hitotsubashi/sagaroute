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

const resetResultFile = async (resultPath: string) => {
  const { ext, name, dir } = path.parse(resultPath);
  const originFileName = `${name}.origin${ext}`;
  const originPath = path.join(dir, originFileName);
  const origin = await readFileAsync(originPath, 'utf8');
  await writeFileAsync(resultPath, origin, 'utf8');
};

const compareWithExpectedFile = async (resultPath: string) => {
  const { ext, name, dir } = path.parse(resultPath);
  const expectedFileName = `${name}.expected${ext}`;
  // 取出结果
  const doc = await vscode.workspace.openTextDocument(resultPath);
  const result = doc.getText();
  // 取出expected
  const expectedPath = path.join(dir, expectedFileName);
  const expected = await readFileAsync(expectedPath, 'utf8');
  // 对比
  assert.equal(result, expected);
};

// @ts-ignore
suite('Test Command', () => {
  test('test sagaroute.routing', async () => {
    const base = getWorkspaceFolderUri('normal');
    const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
    // 重置result文件内容
    await resetResultFile(resultPath);
    // 激活Sagaroute插件
    // await vscode.workspace.openTextDocument(path.join(base.fsPath, 'src', 'pages', 'index.tsx'));
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.routing');
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath);
  });
});
