## API 说明

### dirpath

- **类型**: `string`
- **默认值**: `src/pages`

页面文件目录的路径

### layoutDirPath

- **类型**: `string`
- **默认值**: `src/layouts`

页面文件目录的路径

### routeFilePath

- **类型**: `string`
- **默认值**: `src/route.tsx`

要注入路由列表的文件的路径

### lazy

- **类型**: `boolean/function(path: string): boolean`
- **默认值**: `false`

**注意：此功能要求用户项目中的`react-router`版本为`>=6.4`，且需要使用`data router`以初始化，详情请看[react-router: lazy](https://reactrouter.com/en/main/route/lazy#lazy)**

是否设置注册路由为懒加载模式。类型可以为布尔量或函数，若为函数，传参为页面文件的**绝对路径**(注意`window`和`linux`的系统分隔符是不一样的)，会根据函数返回的布尔量结果来决定该页面文件对应的路由是否为懒加载模式

下面提供两个注入路由后的文件内容，来展示设定`lazy`前后的效果

**`lazy`未被设定或设定为`false`时 👇**

```jsx
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PageIndex from './pages/index.jsx';
import { loader1 as UtilLoaderLoader1 } from './utils/loader';
/* injected by sagaroute: end */

/* sagaroute-inject:routes */
const routes = [
  {
    path: '/',
    element: <PagesIndex />,
    loader: UtilLoaderLoader1,
  },
];
```

**`lazy`未被设定或设定为`true`时 👇**

```jsx
/* sagaroute-inject:imports */

/* sagaroute-inject:routes */
const routes = [
  {
    path: '/',
    lazy: async function () {
      const { default: PagesIndex } = await import('./pages/index.jsx');
      const { loader1: UtilLoaderLoader1 } = await import('./utils/loader');
      return {
        Component: PagesIndex,
        loader: UtilLoaderLoader1,
      };
    },
  },
];
```

`@sagaroute/react`会自动把页面中所有的路由属性（除了`path`、`index`、`children`、`caseSensitive`）都放在`lazy`函数中进行懒加载，这样的好处是当项目打包时，让应用入口文件资源变小，代码分割以页面文件为颗粒大小进行分割

### hooks

- **类型**: `Object`
- **默认值**: 无

分布于执行周期中每个阶段的钩子函数，你可以通过钩子函数去更改每个阶段的生成结果，甚至可以阻断流程的执行。详细可看[钩子函数](./Hook.md)

### pathRewrite

- **类型**: `{[regexp: string]: string}`
- **默认值**: 无

用于对`import`语句中的路径进行替换。`pathRewrite`是一个对象，其键名为正则字符串，键值为要替换成的字符串

下面提供两个注入路由后的文件内容，来展示设定`pathRewrite`前后的效果

**`pathRewrite`未被设定时 👇**

```js
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PageIndex from './pages/index.jsx';
/* injected by sagaroute: end */

/* sagaroute-inject:routes */
const routes = [
  {
    path: '/',
    element: <PagesIndex />,
    loader: async function () {
      const { fetchUser } = await import('./apis');
      return fetchUser();
    },
  },
];
```

**`pathRewrite`被设定为`{'^./': '@/'}`时 👇**

```js
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PageIndex from '@/pages/index.jsx';
/* injected by sagaroute: end */

/* sagaroute-inject:routes */
const routes = [
  {
    path: '/',
    element: <PagesIndex />,
    loader: async function () {
      const { fetchUser } = await import('@/apis');
      return fetchUser();
    },
  },
];
```

除了上述使用方式，还有更常见的使用场景是去掉文件的后缀格式名，当上述例子中的`pathRewrite`被设定为`{'.jsx$': ''}`时，会生成以下 👇 效果：

```js
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import PageIndex from './pages/index';
/* injected by sagaroute: end */

/* sagaroute-inject:routes */
const routes = [
  {
    path: '/',
    element: <PagesIndex />,
    loader: async function () {
      const { fetchUser } = await import('./apis');
      return fetchUser();
    },
  },
];
```

### rootPath

- **类型**: `string`
- **默认值**: `process.cwd()`即`@sagaroute/react`实例的当前运行环境

指定在哪个路径的工作目录下执行生成路由列表的操作

### onWarning

- **类型**: `function(message: string): void`
- **默认值**: 无

当`@sagaroute/react`示例在执行生成路由列表期间发出警告信息时，会调用其回调函数
