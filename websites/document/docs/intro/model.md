---
sidebar_position: 1
---

# 数据模型

> Redux is a predictable state container for JavaScript apps.
> 
> It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as live code editing combined with a time traveling debugger.

不可否认，Redux是一个优秀的状态管理库。 它有很多优点，比如行为一致、易用测试、清晰的数据流向、良好的开发者体验等。下面是一张 Redux 的数据流演示图： 

<h4 align="center">
  <a href="https://Redux.js.org/tutorials/essentials/part-1-overview-concepts" target="_blank">
    <img src="/img/ReduxDataFlowDiagram.gif" width="500" align="center" />
  </a>
</h4>

可以看到这样的数据流是相当清晰的。但是，使用 Redux 的过程中我们还是遇到了不少问题：

- 为实现简单的功能，需要编写大量的模版代码，比如 reducer、action、actionCreator 等等
- 在 React 组件中使用 Redux 需要：
  - 使用 useSelector 或 connect 从**全局状态**中订阅数据
  - 使用 bindActionCreators 或者手写 dispatch 来封装 action 的派发方法。
- 对于异步状态的维护比较麻烦，需要借助 Redux-thunk 之类的中间件来实现异步 action。

整个开发过程相对繁琐。**更重要的是**，虽然数据流向是清晰了，但是**数据模型**却不清晰，数据的**定义**以及对数据的**更新**、**订阅**等操作是割裂开来的。

为什么不能将业务数据抽象成一个个的稳定简单的模型：**定义好数据类型和初始值，然后提供便捷的相增删改查方法**呢? 为了简化 Redux 的使用以及方便前端的数据建模，React-Ducky 提供了一个核心的 Api — `createModel`, 下面是一个简单的示例：

### 定义一个模型

```ts title="countModel.ts"
import { updateReducer, store } from './store'
import { createModel, PayloadAction } from 'React-Ducky';

const countModel = createModel({
  statePaths: ['count'],
  initialState: {
    count: 0,
  },
  reducers: {
    add: (state, action: PayloadAction<number>) => {
      state.count += action.payload;
    },
    minus: (state, action: PayloadAction<number>) => {
      state.count -= action.payload;
    },
  }
});
// 合并到 RootReducer 上
updateReducer({ count: countModel.reducer });
```

### 为模型编写测试代码
```tsx title="countModel.test.tsx"
expect(countModel.getState()).toBe(store.getState().count); // pass：

countModel.actions.add(2);
expect(countModel.getState().count).toBe(2);                // pass

countModel.actions.minus(4);
expect(countModel.getState().count).toBe(-2);               // pass

const wrapper = ({ children }) => (
  <ReduxProvider store={store}>
    {children}
  </ReduxProvider>
);
const { result, waitForNextUpdate } = renderHook(
  () => countModel.useModel((state) => state.count),
  { wrapper },
)

countModel.actions.add(2)
await waitForNextUpdate();
expect(result.current).toBe(0);       // pass，因为 initCount === -2
```

可以看到，不管是模型的**建立**、数据的**订阅**和**更新**都是非常简单的，整个过程没有任何多余的代码。

此外，`createModel` 还提供一些额外的特性：

- 异步数据加载
- 可选的持久化缓存配置