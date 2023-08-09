import * as assert from 'assert';
import path from 'path';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import * as vscode from 'vscode';

export const getWorkspaceFolderUri = (workspaceFolderName: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders!.find((folder) => {
    return folder.name === workspaceFolderName;
  });
  if (!workspaceFolder) {
    throw new Error(
      'Folder not found in workspace. Did you forget to add the test folder to xxx.code-workspace?',
    );
  }
  return workspaceFolder!.uri;
};

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const readFileAsync: (filePath: string, encoding: 'utf8') => Promise<string> = promisify(readFile);
const writeFileAsync: (filePath: string, data: string, encoding: 'utf8') => Promise<void> =
  promisify(writeFile);

export const resetResultFile = async (resultPath: string) => {
  const { ext, name, dir } = path.parse(resultPath);
  const originFileName = `${name}.origin${ext}`;
  const originPath = path.join(dir, originFileName);
  const origin = await readFileAsync(originPath, 'utf8');
  await writeFileAsync(resultPath, origin, 'utf8');
};

export const compareWithExpectedFile = async (resultPath: string, expectedName = 'expected') => {
  const { ext, name, dir } = path.parse(resultPath);
  const expectedFileName = `${name}.${expectedName}${ext}`;
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
suite('Test Command', function () {
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
    await wait(300);
    await vscode.commands.executeCommand('sagaroute.toggle');
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath);
  });

  test('test sagaroute.routing', async () => {
    // 重置result文件内容
    await resetResultFile(resultPath);
    // 执行命令
    await wait(300);
    await vscode.commands.executeCommand('sagaroute.routing');
    await wait(600);
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath);
  });
});
