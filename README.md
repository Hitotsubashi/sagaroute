<p align="center">
    <img alt="LOGO" src="./doc/images/LOGO.png" width="200">
</p>

<h1 align="center">Sagaroute</h1>

<div align=center>
    <img src="https://github.com/Hitotsubashi/sagaroute/actions/workflows/ci.yml/badge.svg"/> 
    <img src="https://codecov.io/gh/Hitotsubashi/sagaroute/branch/main/graph/badge.svg?token=JUSGSALPH6"/>
</div>

<div align="center">
一套用于实现约定式路由的插件
</div>

## ✨ 特性

- 📦 开箱即用的`VSCode`插件和`cmd`工具
- 🔖 生成符合`react-router@6`的路由列表，且支持任意路由属性的设置
- ⛳ 生成的路由列表直接插入到代码中，供用户阅读
- 🛠️ 支持[配置文件](./packages/react/README.md#配置文件)，可通过钩子函数控制工作流程或增强路由对象
- ⚙️ 基础插件可放入到脚手架上以实现约定式路由功能

## 🔨 插件

### 基础插件

如果只是想在日常开发中为项目生成路由列表，那以下**基础插件**可以满足大部分需求

- [`sagaroute-vscode`](./packages/vscode-ext/README.md): 用于快速生成约定式路由列表的`VSCode`插件，可持续监听工作区的文件变动以动态生成路由列表
- [`@sagaroute/cmd`](./packages/cmd/README.md): 快速生成约定式路由列表的命令行工具

### 高级插件

如果想在自行设计的脚手架中实现约定式路由功能，则可使用以下**高级插件**。

- [`@sagaroute/react`](./packages/react/README.md): 用于生成`react-router@6+`路由列表的核心库
