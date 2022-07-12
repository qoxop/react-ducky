# rc-bfcache

浏览器使用 [前进后退缓存(Back/forward cache)](https://web.dev/bfcache/) 优化了用户浏览网站的导航体验，但是这只是针对不同页面间的前进后退，对于 spa 应用是不起作用的，但是很多 spa 应用也会有类似的缓存需求，实现这类需求往往会入侵业务代码，从而造成混乱。

为此，rc-bfcache 提供了一个 [history](https://github.com/remix-run/history) 扩展函数，维护了一份与浏览器同步的路由栈信息，为组件状态缓存的**自动清除**提供判断依据。使用者在对 `history` 对象进行能力扩展后，只需要调用与 `useState` 类似的 hook 方法 — `useRouteState`，即可让组件状态获得缓存能力，而无需关心缓存清空逻辑。

当然，这一切的前提是：你所使用的路由框架(如: [react-router](https://reactrouter.com/))依赖于 [history](https://github.com/remix-run/history) 这个库，同时允许传入自定义的 `history` 对象。

## 安装

```shell
pnpm install rc-bfcache
```

## 使用

### 1、扩展 history 对象

使用 `enhanceHistory` 扩展 history 对象的能力。

```tsx
import React from 'react';
import { 
  unstable_HistoryRouter as HistoryRouter,
  HistoryRouterProps
} from 'react-router-dom';
import { enhanceHistory } from 'rc-bfcache'
import { createBrowserHistory } from 'history';

const myHistory = enhanceHistory(createBrowserHistory({ window }))

export const CustomRouter = (props: HistoryRouterProps) => (
  <HistoryRouter {...props} history={myHistory} />
);
```

> 注意：请保证项目依赖的 history 软件包版本与 react-router 的保持一致。

### 2、使用组件状态缓存
```ts

type SetRefState<S> = (
  /** 待更新的值 */
  state: S | ((s: S) => S),
  /** 更新值的时候，阻止重新渲染 */
  preventUpdate?: boolean
) => void;
function useBfCache<T>(init: T | (() => T), suffix?: string): [T, SetRefState<T>]
```

`useBfCache` 的使用于 `useState`类似, 区别在于它可以传入第二个参数，用于标识页面缓存的 key 值，只要确保在当前页面下是唯一的即可，因为当前 hook 状态缓存的 ID 是当前页面ID与key值的组合。

```tsx
import React, { useEffect } from 'react'
import { useBfCache } from 'rc-bfcache';

const DataContainer = () => {
  // 浏览器前进后退过程中
  // 组件会使用缓存中的状态进行初始化
  const [data, setData] = useBfCache(null, 'data');
  useEffect(() => {
    if (!data) {
      fetchData().then(data => setData(data))
    }
  }, []);
  return (<DataRender data={data} />)
}
```

### 获取路由动作

#### `useRouteAction`

在组件内获取路由动作，支持传入回调函数，该回调函数仅会在首次渲染前执行一次。

```tsx
import { useRouteAction, withRouteAction } from 'rc-bfcache';
export const RouteComponent = () => {
  const action = useRouteAction((action) => {
    switch (action) {
      case 'PUSH': /* do something */ break;
      case 'POP': /* do something */ break;
      case 'REPLACE': /* do something */ break;
    }
  });
  console.log(action);
  return (<>{/* */}</>)
}
```

####  `withRouteAction`

使用高阶函数将路由动作传给目标组件的 `props.routeAction` 属性。支持传入回调函数，如果回调函数返回值为 Promise 对象，那么在 Promise 对象 resolve 之前，组件默认只渲染`fallback` 参数(默认值为`null`)，resolve 之后渲染目标组件。

```tsx
import { withRouteAction } from 'rc-bfcache';
import { MyComponent } from './components';

export const RouteComponent = withRouteAction(MyComponent, {
  callback(action) {
    switch (action) {
      case 'PUSH': /* do something */ break;
      case 'POP': /* do something */ break;
      case 'REPLACE': /* do something */ break;
    }
  },
  fallback: "loading..."
})
```