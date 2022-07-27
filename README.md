
# react-ducky
<h2 align="center">
  <a href="https://react-ducky.qoxop.run/">
  <img src="http://files.qoxop.run/prod/images/react-ducky-cover.png" alt="react-ducky Logo" width="500">
  </a>
</h2>
<h3 align="center">
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/react-ducky">
  <img alt="npm" src="https://img.shields.io/npm/dy/react-ducky">
</h3>

react-ducky 是一个以优化业务逻辑为目的的 React 工具库。由一下几个 npm 包组合而成：
- [rd-model](./packages/redux-model): 简化 redux 在 react 应用的中的使用。
- [rc-bfcache](./packages/react-bfcache): 提供 history 增强函数，模拟浏览器的前进后退缓存，用于优化 react 页面跳转体验
- [rc-controller](./packages/react-controller): 用 Class 组织和封装函数组件中用于处理业务逻辑的方法，减少 ref 的使用，避免函数的重复创建。

## 安装

```shell
pnpm install react-ducky
```
如果你只想要部分功能，可以选择只安装对应的子 npm 包，`rd-model`、`rc-bfcache`、`rc-controller`。


## 核心功能

### 一、状态管理

react-ducky 针对 redux 封装了一套简易的 API，类似于 redux-toolkit。react-ducky 将 redux 的 reducer 切片抽象成数据模型，将切片数据的定义、修改方法、订阅方法、持久化缓存、异步数据获取都统一在了一起。当你使用 `createModel` 方法定义完一个数据模型后，你对 redux 状态数据的任何操作和订阅都能通过这个模型对象进行。

### 二、前进后退缓存

浏览器使用 [前进后退缓存(Back/forward cache)](https://web.dev/bfcache/) 优化了用户浏览网站的导航体验，但是它只是针对不同页面间的前进后退，对于 spa 应用是不起作用的，但是很多 spa 应用也会有类似的缓存需求，实现这类需求往往会入侵业务代码，从而造成混乱。

为此， react-ducky 提供了一个 [history](https://github.com/remix-run/history) 增强函数，维护了一份与浏览器同步的路由栈信息，为组件状态缓存的**自动清除**提供判断依据。使用者在对 history 进行增强后，只需要调用与 `useState` 类似的 hook 方法 — `useRouteState`，即可让组件状态获得缓存能力，而无需关心缓存清空逻辑。

当然，这一切的前提是：你所使用的路由框架(如: [react-router](https://reactrouter.com/))依赖于 [history](https://github.com/remix-run/history) 这个库，同时允许传入自定义的 `history` 对象。

### 三、业务逻辑控制器

在函数组件中使用 hook 可以方便地封装和复用逻辑，但当业务逻辑变得复杂时，代码可能会变得不简洁甚至混乱，某些处理方法不得不定义在组件内，随着组件更新重复地创建。同时必须时刻注意闭包问题，避免取值错误，有时往往需要使用很多 ref。

业务逻辑控制器提供了一种 `class + hook` 的方式来编写你的业务逻辑。用 Class 组织和封装函数组件中用于处理业务逻辑的方法，减少 ref 的使用，避免函数的重复创建，同时让代码更加简洁。

## ✨ 特性

- 纯 TS 编写，提供完善的类型提醒 。
- 单元测试已覆盖核心场景，仍在继续完善中。