优化补充：

1. 详细化NavigateFunction的来源📇
2. 考虑是否初次加载时立即执行约定式路由的生成 ✅(不立即执行，让用户自行触发)
   - 存在问题：会导致onDiagnosis提前执行 ✅
3. Sagaroute Server日志
4. 路由字符串样式重新筛选

onCompletion:

1. 考虑500ms的throttle是否会对completion的结果造成影响

Decoration:

1. 处理样式残影问题 ✅

onHover:

1. window，Mac下onHover会第二次才生效

onDefinition:

1. 优化选中整个字符串

ast:

1. navigate中第一形参为表达式的情况
2. Link中to参数为表达式的情况
3. 支持``模板字符串
