测试补充：

1. 尝试补充测试用例✅
   <!-- 0 -->
   - sagaroute.toggle命令
   - sagaroute.routing命令
   <!-- 1 -->
   - 添加文件（多个）
   - 更改文件（多个）
   - 测试缓存机制，根据fs.stat.mtime
   - 删除文件（多个）
   - 重命名文件夹
   <!-- 2 -->
   - 新增sagaroute.config.cjs
   - 尝试写错sagaroute.config.cjs触发报错，在纠正sagaroute.config.cjs后重新执行
   - 更改sagaroute.config.cjs
   - 删除sagaroute.config.cjs
   <!-- 3 在有sagaroute.config.js的情况下 -->
   - 尝试写错routeFile触发onWarning，在纠正routeFile后重新执行
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
8. launch.json可以放到根目录上运行📇
9. 补充package.json中的keyword，description ✅
10. 把routingWatcher的设计从chokidar换成vscode.watcher（注意先测试vscode.watcher是否可以监听到git的取消）📇
11. 对配置文件的格式校验
12. 路由属性设置优化 📇
    - 直观、快捷看到组件的路由属性
    - 能快速修改组件的路由属性
13. 深化parseRoute的逻辑

bug修复：

1. babel在解析routeFile错误后的处理 ✅
2. babel在解析文件出现错误后的处理 ✅

文档补充：

1. 补充 aggregate📇
2. 补充ext插件的hook只运行到inject.before ✅
3. 补充@sagaroute/react提取出来 ✅
4. 类型判断添加 ✅
