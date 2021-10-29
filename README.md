# react-ducky

一个用来提升`redux`使用体验, 以及优化复杂组件的逻辑管理的工具库。

## 项目背景
我很喜欢新版的`redux/react-redux`的`hook`写法(摆脱丑陋的connect函数)，以及`@redux/tookit`中的`createSlice` API。但由于很多原因，部分项目暂时升级不了`redux/react-redux`版本，这个库一开始的目的就是为了实现一套类似的API来优化旧项目的`react/redux`代码。但后来也添加了一些我自己认为比较有用的特性。比如:
- 使用 slice 的数据持久化
- 使用MVC模式组织react组件的工具
- 结合suspences使用同步方式获取异步Redux状态等。


## 安装
```
yarn install @qoxop/rs-tools
```

## 使用

使用 `ReduxProvider` 包裹在你的根组件，传入一个`redux`的`store`

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ReduxProvider } from '@qoxop/rs-tools';
import { store } from './store';
import App from './App';

ReactDOM.render(
      <ReduxProvider store={store}>
        <React.Suspense fallback={<div>loading...</div>}>
          <App />
        </React.Suspense>
    </React.StrictMode>,
    document.getElementById('root')
)
```

## API

### useSelector
```tsx
interface UseSelector<S = any, P = any> {
    (selector: (state:S) => P), isEqual?: (last: P, cur: P) => boolean): P;
}
```

### useDispatch
```
import { Dispatch } from 'redux'
interface UseDispatch {
    (): Dispatch;
}
```

### useStore

```tsx
import { Store } from 'redux'
interface UseStore {
    (): Store;
}
```

### useGetAsyncState

与`useSelector`功能类似，不同的是，如果通过selector获取的值是一个pending状态的异步对象，那么改hook将会抛出一个promise的异常，该promise的状态会随异步对象的状态改变而改变, 当然，如果该异步对象本书就是一个 promise 则直接将其抛出。example

```tsx
interface UseSelector<S = any, P = any> {
    (
      selector: (state:S) => P), 
      options?: {
      	isEqual?: (last: P, cur: P) => boolean;
				isPending?: (p: P, state?: S) => boolean;
			}
    ): P;
}
function defaultIsEqual(last: any, cur: any) {
  return last === cur;
}
function defaultIsPending(subState: any) {
  return subState?.isPending || subState === undefined || subState === null;
}
```

⚠️ 注意：该方法需要与React.Suspense结合使用

### createModel

> 文档待完善