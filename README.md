# react-ducky

React-Ducky 是一个基于MVC思想而设计的一个 React & Redux 工具库。

## 特性​
- 🦖 简化 Redux 的书写方式，让你更容易地基于 Redux 进行数据的建模
- 💥 用 Class 写法组织你的组件逻辑，但又不妨碍你使用 Hooks 的逻辑抽象能力
- ⏰ 完善的 Typescript 类型提醒
- 👬 优化路由定义，让你进行路由跳转时更加安全快捷，TODO

[ 👉 查看文档 📝](https://qoxop.github.io/react-ducky-doc/)

## 动机

一开始的动机仅仅只是为了让那些暂时无法升级的 redux/react-redux 的项目可以用上新版的 API（比如 react-redux 提供的 `useSelector`, 以及 toolkit 提供的 `createSlice` 等）。

但后来发现即使用上了这些新的特性还是没有办法很好改善复杂组件或模块的代码。因为事实上，工具只能再很小的程度上去改善你的代码，只有良好的代码设计才能避免你的代码变得臃肿且不可维护。面对一个复杂模块，我们往往需要认真对待以下事项：

1. 对 UI 状态、领域数据进行建模
2. 对业务逻辑、交互流程进行抽象概括
3. 以组件化的方式组织 UI 界面

🤔 这就很适合使用 MVC 模式对代码进行设计。所以，React-Ducky 中提供了 `useController`, `createMode` 等方法，用于方便我们使用MVC模式进行代码的编写。

## 安装
```shell
yarn add react-ducky
```

## Road map

以下是规划中的事项，按优先级排序:

- [ ] 基于初始值 hash 判断 Model 数据持久化缓存的有效性
- [ ] 单元测试覆盖
- [ ] 实现路由的 Ts 定义方法，自动生成带类型提醒的跳转方法
- [ ] 英文文档编写