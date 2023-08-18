<p align="center">
    <img alt="LOGO" src="./doc/images/LOGO.png" width="200">
</p>

<h1 align="center">Sagaroute</h1>

<div align=center>
    <img src="https://github.com/Hitotsubashi/sagaroute/actions/workflows/ci.yml/badge.svg"/> 
    <img src="https://codecov.io/gh/Hitotsubashi/sagaroute/branch/feature_test_workflow/graph/badge.svg?token=JUSGSALPH6"/>
</div>

<div align="center">
一套用于实现约定式路由的插件
</div>

## ✨ 特性

- 📦 开箱即用: 提供`VSCode`插件和`cmd`工具以生成路由列表，可在任意项目中使用。
<!-- - 💡 支持多种框架: 提供不同工具以生成对应`vue-router`、`react-router`等多种格式的路由列表。 -->
- 🔖 无需渲染模版: 生成的路由列表会注入到指定文件(`js`、`ts`、`jsx`、`tsx`)的指定变量或语句上。
- ⛳ 支持多种路由: 默认支持**动态路由**、**全局`layout`**、**404 路由**、**嵌套路由**。
- 📪 支持路由参数: 可在路由对应的文件上设置路由参数，参数会复制到对应的路由对象上。
- 🛠️ 配置灵活: 提供钩子函数，可以通过钩子函数控制工作流程或更改生成的路由对象。
- ⚙️ 配套工具: 可作为插件放入到脚手架上以实现约定式路由功能.

## 插件

### 基础插件

如果只是想在日常开发中为项目生成路由列表，那以下**基础插件**可以满足大部分需求。

- `@sagaroute/cmd`: 根据`cmd`命令生成路由列表的插件。
- `@sagaroute/vscode-extension`: 生成路由列表的`VSCode`插件，可持续监听工作区的文件变动以动态生成路由列表。

### 高级插件

如果想自行设计生成约定式路由插件，则可使用以下**高级插件**。

- `@sagaroute/react`: 用于生成`react-router`路由列表的核心库，兼容`react-router@6+`。
