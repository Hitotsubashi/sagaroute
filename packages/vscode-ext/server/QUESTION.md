优化补充：

1. 详细化NavigateFunction的来源📇
2. 考虑是否初次加载时立即执行约定式路由的生成 ✅(不立即执行，让用户自行触发)
   - 存在问题：会导致onDiagnosis提前执行 ✅
3. Sagaroute Server日志
4. 路由字符串样式重新筛选
5. 再非路由文件中测试使用相对路径的情况

onCompletion:

6. 考虑500ms的throttle是否会对completion的结果造成影响
7. 考虑是否支持ToVariable
8. 支持相对路径

Decoration:

1. 处理样式残影问题 ✅

onHover:

1. window，Mac下onHover会第二次才生效

onDefinition:

1. 优化选中整个字符串
