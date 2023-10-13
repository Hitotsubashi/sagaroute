优化补充：

1. 详细化NavigateFunction的来源📇
2. 考虑是否初次加载时立即执行约定式路由的生成
   - 存在问题：会导致onDiagnosis提前执行
3. Sagaroute Server日志

onCompletion:

1. 考虑500ms的throttle是否会对completion的结果造成影响

Decoration:

1. 处理样式残影问题 ✅
