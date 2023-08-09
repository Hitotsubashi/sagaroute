测试补充：

1. 尝试补充测试用例
   <!-- 0 -->
   - sagaroute.toggle命令
   - sagaroute.routing命令
   <!-- 1 -->
   - 添加文件（多个）
   - 更改文件（多个）
   - 测试缓存机制，根据fs.stat.mtime
   - 删除文件（多个）
   - 重命名文件和文件夹（多个）
   - 新增sagaroute.config.cjs
   - 更改sagaroute.config.cjs
   - 删除sagaroute.config.cjs
   - 尝试写错routeFile触发onWarning，在纠正routeFile后重新执行
   - 尝试写错sagaroute.config.cjs触发报错，在纠正sagaroute.config.cjs后重新执行
   - 尝试更改不属于layoutDirpath和dirpath的文件

优化补充：

1. 更改名字以及 settings.json 中所有的名称 ✅
2. statusbar 机制优化 ✅
   - watching 显示绿色文字
   - watching 启动后立即执行 routing
3. 报错时，弹框显示 errorMessage ✅
4. 配置文件错误或者其他警告（变量缺失）时，显示 warningMessage ✅
5. 如果出现 onError 或 onWarn，则取消缓存 ✅
6. 修复 vscode.engine 为 invalid 的情况📇
7. 考虑是否把@sagaroute/react 提取出来📇

文档补充：

1. 补充 aggregate📇
2. 补充ext插件的hook只运行到inject.before
