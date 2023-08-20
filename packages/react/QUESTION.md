测试补充：

1. routing 中两个文件有同一个依赖时，imports 语句是否会冲突 ✅
2. 控制 json stringify 后的字段顺序 ✅
3. lazy 中 ✅
4. path 覆盖测试，以及文档补充（动态路由可用 path 覆盖） ✅

优化补充：

1. 依赖换成 peerDependecies ❌
2. sagaroute 换成 sagaroute-inject ✅
3. import 冲突 ✅
4. gitignore 移除 lib 制品库 ✅
5. 修复 inject 为空的情况 ✅
6. 支持 App.routeProps 挂载方式 ✅
7. 加 chunkname
8. 添加 onWarning ✅
   - 显示 view 中缺失的 templateVariable
   - 显示 template 中缺失的 templateVariable
9. 补充package.json中的keyword，description ✅
10. 根据url反推页面文件并打开

文档补充：

1. index routes 概念 https://reactrouter.com/en/main/start/concepts#index-routes ✅
2. 补充用 pathRewrite 去掉后缀 ✅
3. 更改 routeProps 和 routeOptions 的编写规则以及挂载方式 ✅
4. 寻找/_PURE_/去除 tree-shaking 阶段 ❌
5. 补充 onWarning ✅
6. 补充 readonly 的概念 ❌
7. 补充推荐使用 local class 的说明 ✅
8. /form/筛选例子中补充window和其他系统的分隔符不一致的前提 ✅
9. 类型判断添加
