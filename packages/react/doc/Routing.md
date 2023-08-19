# 约定式路由

> 本插件的约定式路由规则是基于[`umi`](https://v3.umijs.org/zh-CN/docs/convention-routing)(主要)和[`next`](https://nextjs.org/docs/pages/building-your-application/routing)上完善的

约定式路由也叫文件路由，即根据文件系统里的文件夹和文件生成的路由配置

在`@sagaroute/react`实例的运行过程中，会扫描文件系统里的文件夹和文件，根据每个文件夹和文件的命名、文件里的内容去生成路由列表。文件系统的路径可通过[`dirpath`](./API.md#dirpath)来指定

比如存在路径为`src/pages`的文件系统，其文件结构如下所示：

```bash
  └── pages
      ├── index.tsx
      └── users.tsx
```

经过`@sagaroute/react`扫描处理后会生成以下路由列表：

```jsx
[
  { path: '/', element: <PagesIndex /> },
  { path: 'users', element: <PagesUsers /> },
];
```

上述路由列表可直接用于`react-router`中

需要注意的是，符合以下条件的文件和目录不会被注册为路由：

- 除`_layout`以外，以`.`或`_`为前缀的文件或目录
- 以`d.ts`为后缀的类型定义文件
- 以`test.ts`、`spec.ts`、`e2e.ts`为后缀的测试文件(包括`.js`、`.jsx`、`.tsx`)
- 命名为`components`、`component`、`utils`、`util`的目录
- 并非以`.js`、`.jsx`、`.tsx`、`.ts`为后缀的文件
- 文件内容不包括`JSX`元素

## 动态路由

约定当文件或目录命名用`[]`包裹时，生成的路由会是动态路由

比如：

- `src/pages/users/[id].tsx`对应的路由路径为`/users/:id`
- `src/pages/users/[id]/settings.tsx`对应的路由路径为`/users/:id/settings`

举个完整的例子，比如以下文件结构：

```bash
  └── pages
      ├── [post]
      │   ├── index.tsx
      │   └── comments.tsx
      ├── users
      │   └── [id].tsx
      └── index.tsx
```

会生成以下路由列表：

```jsx
[
  {
    path: ':post',
    children: [
      { index: true, element: <PagesPostIndex /> },
      { path: 'comments', element: <PagesPostComments /> },
    ],
  },
  {
    path: 'users',
    children: [{ path: ':id', element: <PagesUsersId /> }],
  },
  {
    path: '/',
    element: <PagesIndex />,
  },
];
```

## 动态可选路由

约定当文件或目录命名用`[$]`包裹时，生成的路由会是动态可选路由

比如：

- `src/pages/users/[id$].tsx`对应的路由路径为`/users/:id?`
- `src/pages/users/[id$]/settings.tsx`对应的路由路径为`/users/:id?/settings`

举个完整的例子，比如以下文件结构：

```bash
  └── pages
    ├── [post$]
    │   └── comments.tsx
    ├── users
    │   └── [id$].tsx
    └── index.tsx
```

会生成以下路由列表：

```jsx
[
  {
    path: ':post?',
    children: [{ path: 'comments', element: <PagesPostComments /> }],
  },
  {
    path: 'users',
    children: [{ path: ':id?', element: <PagesUsersId /> }],
  },
  {
    path: '/',
    element: <PagesIndex />,
  },
];
```

## 索引路由

约定目录下存在命名为`index`的`jsx`或`tsx`文件时，如果该`index`文件所对应路由为二级路由，则把该路由设为索引路由，即将其路由的`index`属性设为`true`

比如以下文件结构：

```bash
└── pages
    └── users
        ├── index.tsx
        └── list.tsx
```

会生成以下路由列表：

```jsx
[
  {
    path: 'users',
    children: [
      { index: true, element: <PagesUsersIndex /> },
      { path: 'list', element: <PagesUsersList /> },
    ],
  },
];
```

如果不想让`index`文件成为索引路由，则可以在`index`文件内部指定`routeProps.index`的值为`false`，如下所示：

```jsx
export default function PagesIndex() {
  // ...
}

PagesIndex.routeProps = {
  index: false,
};
```

修改后生成路由：

```tsx
[
  {
    path: 'users',
    children: [
      { path: 'index', index: false, element: <PagesUsersIndex /> },
      { path: 'list', element: <PagesUsersList /> },
    ],
  },
];
```

## 嵌套路由

约定目录下存在命名为`_layout`的`jsx`或`tsx`文件时，会把`_layout`文件作为该目录所对应路由的`element`。`_layout`文件需要默认导出一个`React`组件，且该`React` 组件中需要包含`react-router`提供的[`Outlet`](https://reactrouter.com/en/main/components/outlet)组件。

比如以下文件结构：

```bash
└── pages
    └── users
        ├── _layout.tsx
        ├── index.tsx
        └── list.tsx
```

会生成以下路由列表：

```jsx
[
  {
    path: 'users',
    element: <PagesUsersLayout />,
    children: [
      { index: true, element: <PagesUsersIndex /> },
      { path: 'list', element: <PagesUsersList /> },
    ],
  },
];
```

## 全局 layout

约定`{layoutDirPath}/index.(j|t)sx`为**全局路由文件**，[layoutDirPath 属性](./API.md#layoutdirpath)默认值为`src/layouts`，你可以通过设定`layoutDirPath`去修改**全局路由文件**所在文件夹的位置，注意只支持存在一个**全局路由文件**）。**全局路由文件**需要默认导出一个`React`组件，且该`React`组件中需要包含`react-router`提供的[`Outlet`](https://reactrouter.com/en/main/components/outlet)组件。

比如以下目录结构：

```bash
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        └── users.tsx
```

会生成以下路由列表：

```jsx
[
  {
    path: '/',
    element: <LayoutsIndex />,
    children: [
      { index: true, element: <PagesIndex /> },
      { path: 'users', element: <PagesUsers /> },
    ],
  },
];
```

## 多个全局路由

`@sagaroute/react`只支持存在一个**全局路由文件**，但你可以通过以下两种方法来实现多个全局路由：

### 方法一

在**全局路由文件**中对当前路径做判断区分，以渲染不同的 layout，如下所示：

```jsx
import LoginLayout from './LoginLayout';
import DashboardLayout from './DashboardLayout';
import { useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  return location.pathname === '/login' ? <LoginLayout /> : <DashboardLayout />;
};

export default Layout;
```

### 方法二

在文件系统中的一级文件或者一级目录里的`_layout`文件中设置[`routeOptions.layout`](#layout)属性为`false`，该属性会使其注册路由脱离全局路由独立渲染。

比如以下目录结构：

```bash
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        ├── users.tsx
        └── permission
            ├── _layout.tsx
            └── role.tsx
```

其中`src/pages/users.tsx`文件中设置了`routeOptions.layout`为`false`，如下所示：

```tsx
export default function User() {
  return <div>User...</div>;
}

User.routeOptions = {
  layout: false,
};
```

与此同时，其中的`src/pages/permission/_layout.tsx`文件也和上述代码一样设置了`routeOptions.layout`为`false`。

则会生成以下路由列表：

```jsx
[
  {
    path: '/',
    element: <LayoutsIndex />,
    children: [
      { index: true, element: <PagesIndex /> },
      { path: 'users', element: <PagesUsers /> },
    ],
  },
  { path: 'users', element: <PagesUsers /> },
  {
    path: 'permission',
    element: <PagrsPermissionLayout />,
    children: [{ path: 'role', element: <PagrsPermissionRole /> }],
  },
];
```

## 404 路由

约定`{dirpath}/404.(t|j)sx`为 404 页面，其注册路由会是一个星号路由，且该路由不会挂载于全局路由上。

比如以下目录结构，

```bash
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        ├── users.tsx
        └── 404.tsx
```

会生成路由：

```tsx
[
  {
    path: '/',
    element: <LayoutsIndex />,
    children: [
      { index: true, element: <PagesIndex /> },
      { path: 'users', element: <PagesUsers /> },
    ],
  },
  {
    path: '*',
    element: <Pages404 />,
  },
];
```

如果不想让`404`文件成为星号路由，则可以在`404`文件内部指定`routeProps.path`的值，如下所示：

```jsx
export default function Pages404() {
  // ...
}

Pages404.routeProps = {
  path: '404',
};
```

修改后生成路由：

```tsx
[
  {
    path: '/',
    element: <LayoutsIndex />,
    children: [
      { index: true, element: <PagesIndex /> },
      { path: 'users', element: <PagesUsers /> },
    ],
  },
  {
    path: '404',
    element: <Pages404 />,
  },
];
```

关于`routeProps`的说明可看[routeProps](#routeprops)。

## 扩展路由属性

### routeProps

`@sagaroute/react`支持在文件上通过代码扩展路由的属性，你可以在组件的`routeProps`字段中设置属性，`routeProps`上的所有属性会复制到注册路由上：

假如存在`src/pages/users.tsx`文件，其文件内容如下所示：

```jsx
export default function Users() {
  return <div>Users...</div>;
}

// 设置routeProps
Users.routeProps = {
  caseSensitive: false,
};
```

生成的注册路由如下所示：

```jsx
{
  path:'user',
  element:<PagesUsers/>,
  caseSensitive: false
}
```

在`react-router@6`中支持的[路由属性](https://reactrouter.com/en/main/route/route#route)如下：

```ts
interface RouteObject {
  path?: string;
  index?: boolean;
  children?: React.ReactNode;
  caseSensitive?: boolean;
  id?: string;
  loader?: LoaderFunction;
  action?: ActionFunction;
  element?: React.ReactNode | null;
  Component?: React.ComponentType | null;
  errorElement?: React.ReactNode | null;
  ErrorBoundary?: React.ComponentType | null;
  handle?: RouteObject['handle'];
  shouldRevalidate?: ShouldRevalidateFunction;
  lazy?: LazyRouteFunction<RouteObject>;
}
```

我们可以`routeProps`上定义上述部分属性以达到增强路由的效果。原则上`routeProps`上的所有属性都会复制到对应的注册路由上，但属性的值需要遵守以下原则：

1. `path`、`index`、`children`、`caseSensitive`这四个属性的值必须为常量，如：

   ```js
   const index = false;

   export default function Comp() {}

   Comp.routeProps = {
     // 错误写法：index的值不能为闭包变量
     index,
     // 错误写法：path的值不能为表达式
     path: location.origin === 'xx' ? 'a' : 'b',
   };

   // 正确写法：所有属性都是常量
   Comp.routeProps = {
     index: false,
     path: 'a',
   };
   ```

   除这四个属性外其余的属性成为**高级属性**，**高级属性**需要遵守下面剩余的原则。

2. **高级属性**的值可以是以下数据类型

   - 六种基础数据类型(`number`、`string`、`boolean`、`null`、`undefined`、`symbol`)
   - 三种引用类型(`object`、`array`、`function`)
   - 所有用`new`实例化的`Javascript`原生高级数据类型如`Map`、`Proxy`等

   但值得注意的是这些值的声明过程中不能引入来自外部的闭包变量，如：

   ```js
   const crumb = () => <Link to="/messages">Messages</Link>;
   const map = {};
   function Loader1(){}

   export default function Comp() {}

   Comp.routeProps = {
     // 错误写法：handle中的属性crumb的值是外部变量crumb
     handle: {
       crumb,
     },
     // 错误写法：map属性的值在初始化时引入外部变量map
     map: new Map(map),
     // 错误写法：loader属性的实例化时的类并不是`Javascript`原生类
     loader: new Loader1()
     // 错误写法：action属性的值执行时调用外部变量fetchTeam
     action: ({ params }) => {
       return fetchTeam(params.teamId);
     },
   };
   ```

   如果属性的值需要引用到外部变量，则请用下面第 2 条规则实现

3. **高级属性**的值可以是变量，使用时请通过`import`语句从其他文件中引入该变量，`@sagaroute/react`会在生成注册路由过程中将其作为依赖引入：

   例如存在`src/pages/users.tsx`文件，其文件内容如下所示：

   ```jsx
   import { action } from '../utils/action';

   export default function User() {}

   User.routeProps = {
     // action从'./utils/action'中引入
     action,
   };
   ```

   最后生成的路由列表如下所示：

   ```jsx
   // @sagaroute/react会对从相对路径导出的变量进行重命名以防变量名重复冲突
   import { action as UtilsActionAction } from './utils/action';
   import PagesUsers from './pages/users.tsx';

   const routes = [
     {
       path: 'users',
       action: UtilsActionAction,
       element: <PagesUsers />,
     },
   ];
   ```

   对于含外部变量的属性值，可以通过这种方式进行引入

4. 如果**高级属性**的值是`jsx`，且`jsx`中用到的组件是从其他文件通过`import`语句导入时，`@sagaroute/react`会在生成注册路由过程中将其作为依赖引入：

   例如存在`src/pages/users.tsx`文件，其文件内容如下所示：

   ```jsx
   import ErrorBoundary from '@/components/Errorboundary';

   export default function User() {}

   User.routeProps = {
     // ErrorBoundary1从'@/components/Errorboundary'中引入
     errorElement: <ErrorBoundary />,
   };
   ```

   最后生成的路由列表如下所示：

   ```jsx
   import ComponentsErrorBoundary from '@/components/Errorboundary';
   import PagesUsers from './pages/users.tsx';

   const routes = [
     {
       path: 'users',
       errorElement: <ComponentsErrorBoundary />,
       element: <PagesUsers />,
     },
   ];
   ```

5. 如果**高级属性**的值是`async function(){}`，且包含来自其他文件的外部变量，则可以采用以下写法：

   ```js
   async function loader1({ params }) {
     // 如果import路径为相对路径，则会自动转换到适配路由文件的路径
     const { fetchTeam } = await import('@/api');
     return fetchTeam(params.teamId);
   }
   ```

### routeOptions

除`routeProps`外，`@sagaroute/react`还支持在页面文件上定义`routeOptions`对象，`routeOptions`用于在路由列表层面上修改路由的位置或模式，其数据类型如下所示：

```ts
interface routeOptions {
  layout?: boolean;
}
```

#### layout

- **类型:** `boolean`
- **默认:** `true`

该属性用于在存在全局路由时，把注册路由提升到与全局路由同一维度上，即在全局路由里渲染。

**注意：此属性只生效于页面文件目录中的一级文件或一级文件夹下的`_layout`文件。**

比如以下目录结构：

```bash
└── src
    ├── layouts
    │   └── index.tsx
    └── pages
        ├── index.tsx
        ├── users.tsx
        └── permission
            ├── _layout.tsx
            └── role.tsx
```

其中`src/pages/users.tsx`文件中设置了`routeOptions.layout`为`false`，如下所示：

```tsx
export default function User() {
  return <div>User...</div>;
}

User.routeOptions = {
  layout: false,
};
```

与此同时，其中的`src/pages/permission/_layout.tsx`文件也和上述代码一样设置了`routeOptions.layout`为`false`。

则会生成以下路由列表：

```jsx
[
  {
    path: '/',
    element: <LayoutsIndex />,
    children: [
      { index: true, element: <PagesIndex /> },
      { path: 'users', element: <PagesUsers /> },
    ],
  },
  { path: 'users', element: <PagesUsers /> },
  {
    path: 'permission',
    element: <PagrsPermissionLayout />,
    children: [{ path: 'role', element: <PagrsPermissionRole /> }],
  },
];
```
