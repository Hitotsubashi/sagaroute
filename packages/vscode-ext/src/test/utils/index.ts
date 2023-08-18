import * as assert from 'assert';
import path from 'path';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import * as vscode from 'vscode';
import { debounce } from 'lodash';

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

export const defaultWaitTime: number = process.env.WAIT_TIME ? Number(process.env.WAIT_TIME) : 400;

export const wait = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms || defaultWaitTime));
const readFileAsync: (filePath: string, encoding: 'utf8') => Promise<string> = promisify(readFile);
const writeFileAsync: (filePath: string, data: string, encoding: 'utf8') => Promise<void> =
  promisify(writeFile);

export const resetResultFile = async (resultPath: string, resetName = 'origin') => {
  const { ext, name, dir } = path.parse(resultPath);
  const originFileName = `${name}.${resetName}${ext}`;
  const originPath = path.join(dir, originFileName);
  const origin = await readFileAsync(originPath, 'utf8');
  await writeFileAsync(resultPath, origin, 'utf8');
  await wait();
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

export const editFile = (filepath: string, content: string, edit: vscode.WorkspaceEdit) => {
  const filePathUri = vscode.Uri.file(filepath);
  return vscode.workspace.openTextDocument(filePathUri).then((document) => {
    const lastline = document.lineAt(document.lineCount - 1);
    const deleteEdit = vscode.TextEdit.delete(
      new vscode.Range(0, 0, lastline.range.end.line, lastline.range.end.character),
    );
    const textEdit = vscode.TextEdit.replace(new vscode.Range(0, 0, 0, 0), content);
    edit.set(filePathUri, [deleteEdit, textEdit]);
    return vscode.workspace.applyEdit(edit).then(() => {
      document.save();
    });
  });
};

export const getMTime = async (filepath: string) => {
  const filePathUri = vscode.Uri.file(filepath);
  const { mtime } = await vscode.workspace.fs.stat(filePathUri);
  return mtime;
};

export const waitUntilFileChange = (
  filepath: string,
  timeout?: number,
  done?: any,
  type?: 'change' | 'create' | 'delete',
) => {
  console.time(filepath);
  return new Promise<void>((resolve, reject) => {
    const watcher = vscode.workspace.createFileSystemWatcher(filepath);
    let timer: NodeJS.Timer | undefined = undefined;
    if (timeout) {
      timer = setInterval(() => {
        const error = new Error(`File: ${filepath} timeout ${timeout}`);
        done(error);
        reject(error);
        clearInterval(timer);
        watcher.dispose();
      }, timeout);
    }
    const handled = debounce(() => {
      console.timeEnd(filepath);
      watcher.dispose();
      resolve();
    }, 50);
    if (!type || type === 'change') {
      watcher.onDidChange(handled);
    }
    if (!type || type === 'create') {
      watcher.onDidCreate(handled);
    }
    if (!type || type === 'delete') {
      watcher.onDidDelete(handled);
    }
  });
};
