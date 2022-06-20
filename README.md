
# React-Ducky
<h2 align="center">
  <a href="./images/cover.png">
  <img src="./images/cover.png?raw=true" alt="React-Ducky Logo" width="500">
  </a>
</h2>
<h3 align="center">
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/react-ducky">
  <img alt="npm" src="https://img.shields.io/npm/dy/react-ducky">
</h3>

React-Ducky 是一个以简化业务逻辑为目的的 React 工具库。主要包含了状态管理、路由缓存、业务逻辑控制器等工具。

[文档地址](https://react-ducky.qoxop.run/)

## 核心功能

### 一、状态管理

React-Ducky 针对 Redux 封装了一套简易的 API，类似于 redux-toolkit。React-Ducky 将 Redux 的 reducer 切片抽象成数据模型，将切片数据的定义、修改方法、订阅方法、持久化缓存、异步数据获取都统一在了一起。当你使用 `createModel` 方法定义完一个数据模型后，你对 Redux 数据的任何操作和订阅都能通过这个模型对象进行，无需编写额外的逻辑。

### 二、路由与缓存

React 以及 react-router 没有提供官方的页面组件 keep-alive 功能，但是为了优化 React 应用前进后退功能的体验，需要使用到页面级的缓存，但如果把缓存控制逻辑入侵到各个业务组件中的话，会让你的代码变得复杂。

React-Ducky 提供了一个基于 history Api 的缓存方案：使用 [`usePageState`](https://react-ducky.qoxop.run/docs/api/react-ducky.usepagestate) 提供页面状态缓存方法，使用 [`usePageEffect`](https://react-ducky.qoxop.run/docs/api/react-ducky.usepageeffect) 或者 [`withPageHook`](https://react-ducky.qoxop.run/docs/api/react-ducky.withpagehook) 判断浏览器进入当前页面的方式。

### 三、业务逻辑控制器

业务逻辑控制器提供了一种 `class + hook` 的方式来编写你的业务逻辑。用 class 的方式封装业务处理逻辑，让代码更加简洁。用 hook 来处理页面副作用，避免了需要将业务逻辑调用需要写在 Class 组件各个生命周期的困扰，同时方便通用逻辑的封装与复用。

## ✨ 特性
- 纯 TS 编写，提供完善的类型提醒 。
- 单元测试已覆盖核心场景，仍在继续完善中。

