# rtk-like

在兼容低版本的 redux 和 react-redux 的基础上实现高版本才有的一些便捷的 redux API，比如 `useSelector`, `createSlice` 等。

## 特性

- 完整的 `TS` 类型提醒
- 兼容低版本 redux、react-redux
- 无代码入侵

## 安装指南
要求 ` react > 16.13.1`
```shell
// 安装依赖裤 immer
yarn add immer

// 再安装 rtk-like
yarn add rtk-like
```

## API 说明

### hooks
要使用 `hooks` 之前，需要给 `redux` 添加一个中间件 `hookMiddleware` , 否则无法使用。

#### hookMiddleware

```js
import { hookMiddleware } from 'rtk-like'
import { applyMiddleware, createStore } from 'redux';

const store = createStore(
  rootReducer,
  initState,
  applyMiddleware(
    hookMiddleware,
    // ...other middleware
  )
)
```
#### useSelector(selector, equalityFn = (a, b) => a === b):any

从redux中订阅部分状态数据

```js
import React from 'react';
import { useSelector } from 'rtk-like';

export function UserCard () {
  const userInfo = useSelector(state => state.user_info);
  return <Card user={userInfo} />
}
```
#### useStore():Store;

在 `react` 组件中获取 `redux` 的 `store` 对象.

#### useDispatch():Dispatch

在 `react` 组件中获取 `redux` 的 `dispatch` 方法.

### 类 redux/toolkti API

#### createSlice(option: ICreateSliceOptions):Slice
```typescript
import {createSlice, PayloadAction} from 'rtk-like';

const { reducer, actions } = createSlice({
  name: 'name',
  initialState: {
    count: 0,
  },
  persistence: 'session',
  reducers: {
    increase(state, PayloadAction<void>) {
      state.count += 1;
    },
    decrease(state, PayloadAction<void>) {
      state.count -= 1;
    }
  },
  extraReducers: (builder) => {
    // 监听 user/logout 动作，重置自身 state 值
    builder.addCase('user/logout', (state, action) => {
      state.count = 0;
    });
  }
})
```

`ICreateSliceOptions` 参数说明
- name：切片的名字，必须全局唯一
- initialState：初始化的状态
- reducers：定义当前切片的 `reducer` 和 `actions`
- extraReducers：用于处理当前切片之外定义的 `actions`
- persistence：可选，状态持久化使用的存储对象，'session'|'local'
- persistenceKey：可选，状态持久化存储使用的 `key` 值;

Slice 字段说明
- name：切片的名字
- reducer：reducer函数
- actions：当前切片所有的 `actionCreator`

#### createActions(type, prepareAction): ActionCreator

[] TODO

#### createAsyncThunk

[] TODO 

#### createReducer

[] TODO


