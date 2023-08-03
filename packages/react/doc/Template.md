# 路由模板文件

在生成路由列表后，`@sagaroute/react`会提取**路由模板文件**的内容，然后根据注释把内容转换为**渲染模板**，然后通过[`Mustache`](https://mustache.github.io/)把路由列表等**模板变量**通过相关的`API`注入以生成路由文件代码(其原理是基于`Mustache.render({渲染模板},{模板变量})`实现的)。

例如存在**路由模板文件**，其内容如下所示：

```js
import React from "react";
import { createBrowserRouter } from "react-router-dom";
/* sagaroute-inject:imports */

/* sagaroute-inject:routes */
const routes = [];
const router = createBrowserRouter(routes);
export default router;
```

`@sagaroute/react`会将上述代码 👆 转换成渲染模板如下 👇 所示：

```js
import React from "react";
import { createBrowserRouter } from "react-router-dom";
{{{imports}}}

const routes = {{{routes}}};
const router = createBrowserRouter(routes);
export default router;
```

注释支持行内注释`// sagaroute-inject:xxx`和块级注释`/* sagaroute-inject:xxx */`，但注释内容的格式必须为`sagaroute-inject:var`，其中`var`可以为任意变量名称，该名称最终会和**渲染模板**中的**模板变量**名称一致。

例如在**路由模板文件**中有以下代码：

```js
import React from "react";
import { createBrowserRouter } from "react-router-dom";
/* sagaroute-inject:imports */

/* sagaroute-inject:routes */
const routes = [];
/* sagaroute-inject:a */
const a = undefined;

/* sagaroute-inject:exports */
```

`@sagaroute/react`会将上述代码 👆 转换成**渲染模板**如下 👇 所示：

```js
import React from "react";
import { createBrowserRouter } from "react-router-dom";
{{{imports}}}


const routes = {{{routes}}};

const a = {{{a}}};

{{{exports}}}
```

在**路由模板文件**中，`sagaroute-inject:imports`和`sagaroute-inject:routes`是默认要标记上的两个注释，因为他们分别指明了路由依赖语句和路由列表代码注入的位置。

**_`sagaroute-inject:imports`和`sagaroute-inject:routes`两个注释是默认但非必要的，你可以在路由模板文件中标记其他注释，然后在[`hooks.print.inject.before`](./Hook.md#printinjectbefore)钩子中按照示例定义模板变量即可。_**

值得一提的是：注释位置的不同会影响解析后**渲染模板**中**模板变量**的位置，因此有以下规则需要谨记：

1.  当注释标记在声明或赋值语句上时，赋值会替换成**模板变量**。

    例如：

    ```js
    let b;

    /* sagaroute-inject:a */
    const a = undefined;
    /* sagaroute-inject:b */
    b = 1;
    /* sagaroute-inject:c */
    export const c = "3";
    ```

    `@sagaroute/react`会将上述代码 👆 转换成**渲染模板**如下 👇 所示：

    ```bash
    let b;

    const a = {{{a}}};

    b = {{{b}}};

    export const c = {{{c}}}
    ```

    **注意：不要在同一行赋值语句上对多个变量进行赋值，如`let b=1,a=2`，这种写法会导致 b 和 a 的赋值都换成同样的模板变量。**

2.  当注释标记在`return`语句上时，返回变量会替换成**模板变量**。

    例如：

    ```js
    function fn1() {
      let a = 1;
      /* sagaroute-inject:a */
      return a;
    }
    ```

    `@sagaroute/react`会将上述代码 👆 转换成**渲染模板**如下 👇 所示：

    ```bash
    function fn1(){
        let a = 1;
        return {{{a}}};
    }
    ```

3.  当注释标记在不符合上述 👆 条件的其余语句时，会直接生成一个**模板变量**。

    例如：

    ```js
    /* sagaroute-inject:prefix */

    /* sagaroute-inject:imports */
    function imports() {}

    /* sagaroute-inject:suffix */
    ```

    `@sagaroute/react`会将上述代码 👆 转换成**渲染模板**如下 👇 所示：

    ```bash
    {{{prefix}}}

    {{{imports}}}
    function imports(){}

    {{{suffix}}}
    ```
