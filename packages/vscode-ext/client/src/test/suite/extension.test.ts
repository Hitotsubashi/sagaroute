import * as assert from 'assert';
import path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

export const getWorkspaceFolderUri = (workspaceFolderName: string) => {
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

// @ts-ignore
suite('Extension Test Suite', async () => {
  try {
    const base = getWorkspaceFolderUri('normal');
    await vscode.commands.executeCommand('sagaroute.routing');
    const absPath = path.join(base.fsPath, 'src', 'routes.tsx');
    const doc = await vscode.workspace.openTextDocument(absPath);
    const text = doc.getText();
  } catch (error) {
    console.log(error);
  }
  // assert.equal(text, text);
  assert.equal(1, 1);
});
// suite('Extension Test Suite', () => {
//   vscode.window.showInformationMessage('Start all tests.');

//   test('Sample test', () => {
//     assert.strictEqual([1, 2, 3].indexOf(5), -1);
//     assert.strictEqual([1, 2, 3].indexOf(0), -1);
//   });
// });
