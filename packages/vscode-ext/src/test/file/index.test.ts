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
} from '../utils';
import { TextEncoder } from 'util';
import * as assert from 'assert';

// @ts-ignore
suite('Test File Operate', function () {
  // @ts-ignore
  this.timeout(defaultWaitTime * 4);

  const base = getWorkspaceFolderUri('file');
  const resultPath = path.join(base.fsPath, 'src', 'routes.tsx');
  const encoder = new TextEncoder();

  test('test routing files', async () => {
    // 重置result文件内容;
    await resetResultFile(resultPath);
    // 执行命令
    await vscode.commands.executeCommand('sagaroute.routing');
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e1');
  });

  // 新增文件
  test('test add multiple files', async () => {
    const edit = new vscode.WorkspaceEdit();
    // 普通文件：404文件-根目录
    edit.createFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/404.tsx')), {
      contents: encoder.encode(
        `
const Page404 = () => {
  // @ts-ignore
  return <div>404</div>;
};

export default Page404;    
`,
      ),
    });
    // _layout文件：user目录
    edit.createFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/user/_layout.tsx')), {
      contents: encoder.encode(
        `
const UserLayout = () => {
  // @ts-ignore
  return <div>UserLayout</div>;
};

export default UserLayout;    
`,
      ),
    });
    // layout文件：全局路由目录
    edit.createFile(vscode.Uri.file(path.join(base.fsPath, 'src/layouts/index.tsx')), {
      contents: encoder.encode(
        `
const Layout = ({children}) => {
  // @ts-ignore
  return <div>{children}</div>;
};

export default Layout;    
`,
      ),
    });
    // index文件：account目录
    edit.createFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/account/index.tsx')), {
      contents: encoder.encode(
        `
const AccountIndex = () => {
  // @ts-ignore
  return <div>AccountIndex</div>;
};

export default AccountIndex;    
`,
      ),
    });
    await vscode.workspace.applyEdit(edit);
    // 执行命令
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e2');
  });

  // 修改文件内容
  test('test edit multiple files', async () => {
    const edit = new vscode.WorkspaceEdit();
    // 修改src/account/index.tsx文件的routeProps.index
    await editFile(
      path.join(base.fsPath, 'src/pages/account/index.tsx'),
      `const AccountIndex = () => {
// @ts-ignore
return <div>AccountIndex</div>;
};

AccountIndex.routeProps = {
index: false
}

export default AccountIndex;    
`,
      edit,
    );
    // 执行命令
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e3');
  });

  // 测试缓存
  test('test cache when edit file', async () => {
    const userLayoutFilePath = path.join(base.fsPath, 'src/pages/user/_layout.tsx');
    const routeFilePath = path.join(base.fsPath, 'src/routes.tsx');
    // 获取文件的修改时间
    const userLayoutFilePreviousTime = await getMTime(userLayoutFilePath);
    const routeFilePreviousTime = await getMTime(routeFilePath);

    // 修改src/account/index.tsx文件的routeProps.index
    const edit = new vscode.WorkspaceEdit();
    await editFile(
      userLayoutFilePath,
      `const UserLayout = () => {
  // @ts-ignore
  return <div>UserLayout1</div>;
};

export default UserLayout;         
`,
      edit,
    );
    // 执行命令
    await wait();
    // 获取文件的修改时间
    const userLayoutFileAfterTime = await getMTime(userLayoutFilePath);
    const routeFileAfterTime = await getMTime(routeFilePath);
    // 对比result文件和expected文件的内容
    assert.notEqual(userLayoutFilePreviousTime, userLayoutFileAfterTime);
    assert.equal(routeFilePreviousTime, routeFileAfterTime);
  });

  // 重命名文件夹
  test('test rename folder', async () => {
    const edit = new vscode.WorkspaceEdit();
    edit.renameFile(
      vscode.Uri.file(path.join(base.fsPath, 'src/pages/user')),
      vscode.Uri.file(path.join(base.fsPath, 'src/pages/user1')),
      { overwrite: true },
    );
    await vscode.workspace.applyEdit(edit);
    // 执行命令
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e4');
  });

  // 删除文件
  test('test delete multiple file', async () => {
    await wait();
    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/404.tsx')));
    edit.deleteFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/user1')), {
      recursive: true,
    });
    edit.deleteFile(vscode.Uri.file(path.join(base.fsPath, 'src/layouts')), { recursive: true });
    edit.deleteFile(vscode.Uri.file(path.join(base.fsPath, 'src/pages/account/index.tsx')));
    await vscode.workspace.applyEdit(edit);
    // 执行命令
    await wait();
    // 对比result文件和expected文件的内容
    await compareWithExpectedFile(resultPath, 'e5');
  });
});
