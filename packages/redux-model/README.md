# rd-model

rd-model 是一个用于简化 redux 在 react 应用中使用的工具库。

核心功能在于将 reducer 切片进行统一封装，将某个 reducer 切片的 state、action、reducer、actionDispatch、useSelector、getState 等对象和方法全部汇总在一个函数调用中定义和生成。让你在 react 中使用 redux 就像是在定义和使用一个数据模型一样简单。

## 安装和初始化
```shell
pnpm install rd-model
```

需要在 react 根组件上包裹 ReduxProvider 组件，给 ReduxProvider 传入一个 store 对象来完成初始化。

```tsx
import ReactDom from 'react-dom';
import { ReduxProvider, initStore } from 'rd-model';
import App from './app';

const { store, updateReducer } = initStore({});

ReactDom.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('root')
);
```

## 基础示例

### 1. 定义模型

```tsx
import {
  initStore,
  createModel,
  PayloadAction,
} from 'rd-model';

const { store, updateReducer } = initStore({});

const countModel = createModel({
  statePaths: ['count_demo'],
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

// 将切片合并到 RootReducer 上
updateReducer({ count_demo: countModel.reducer });
```

### 2. 使用模型

这里用基于 jest 的单元测试用例举例

```tsx title="countModel 的测试用例"
// 1. model.getState
expect(countModel.getState()).toBe(store.getState().count_demo); // pass：

// 2. model.actions
countModel.actions.add(2); // 触发 count_demo/add 动作

expect(countModel.getState().count).toBe(2); // pass

countModel.actions.minus(4); // 触发 count_demo/minus 动作

expect(countModel.getState().count).toBe(-2); // pass

// 3. model.useModel
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
expect(result.current).toBe(0); // pass
```


## 基础API

### useStore

在函数组件中获取 redux 的 store 对象

```ts
const useStore: () => Store<any, AnyAction>
```

### useDispatch

在函数组件中获取 redux 的 dispatch 方法。

```ts
const useDispatch: () => Dispatch<AnyAction>
```

### useSelector

在函数组件中订阅 redux 的状态数据。

```ts
type Selector<S = unknown, P = unknown> = (state: S) => P;

type UseSelectorOptions<P> = {
  /**  同步订阅，redux 值一更新就马上执行组件的 update 操作，默认为 false */
  sync?: boolean;
  /** 对比方法: 默认浅对比 */
  eq?: IsEqual<P>;
  /** 是否与 React.Suspense 配合使用 */
  withSuspense?: boolean | FunctionLike<[P], boolean>;
}

function useSelector<S = DefaultRootState, P = any>(
  selector: Selector<S, P>, 
  options?: UseSelectorOptions<P>
): P
```
配置对象说明:
- sync: 是否立即更新组件状态。默认是否，状态变化时，组件的状态是异步更新的。
- eq: 新旧状态的对比方法，默认使用浅对比函数。
- withSuspense: 一个判断函数，判断所选状态是否为加载中，如果是，则抛出一个 promise，直到状态数据加载完成，promise 才会被 resolve 掉。如果传入值 true，则是使用内部自带的判断函数。

## 核心 API

### createModel

```ts
function createModel(ModelOptions):Model;
```
作为 rd-model 的一个核心函数，它接受初始值、reducers方法对象、持久化配置对象和异步数据获取方法对象等作为参数，并返回 [Model](#model) 对象，对象内包含动作派发、状态订阅、数据加载、reducer 等方法。

```ts
type ModelOptions<STATE> {
  /**
   * 当前 reducer 切片的合并路径
   */
  statePaths: string[];
  /**
   * 初始值
   */
  initialState: STATE;
  /**
   * 数据的更新方法
   * 作用：生成 reducer 与 actionDispatcher
  */
  reducers: { [key: string]: (state, action:PayloadAction<any>) => void };
  /**
   * 异步数据的获取方法。
   * 作用：网络防抖、自动管理 pending 状态
   */
  fetch?: { [key in keyof STATE]?: (...args: unknown[]) => Promise<STATE[key]> };
  /**
   * 持久化缓存相关配置
   */
  cacheKey?: string;
  cacheStorage?: 'session'|'local'|Storage;
  cacheVersion?: string;
  /**
   * 订阅当前切片外的动作
   */
  extraReducers?: Record<string, ReducerCase<STATE>> | FunctionType<[Builder<STATE>], void>;
}
```

PS: 为了实现良好的类型提醒，`ModelOptions` 的 TS 类型比较复杂，这里为了容易阅读，对其进行了简化。

#### statePaths

一个字符串数组，表示当前 reducer 切片的合并路径，它可以帮助 model 对象准确地订阅和修改 redux 中的数据。但是它同时要求你在以同样的路径对 model 的 reducer 方法进行嵌套合并。

```typescript
// 一级嵌套
const testModel = createModel({statePaths: ['test']});
const rootReducer = combineReducers({
  ...otherReducer,
  test: testModel.reducer
});

// 多级嵌套
const testFooModel = createModel({statePaths: ['test', 'foo']});
const testBarModel = createModel({statePaths: ['test', 'bar']});

const rootReducer = combineReducers({
  ...otherReducer,
  test: combineReducers({
    foo: testFooModel.reducer,
    bar: testBarModel.reducer,
  })
});
```

#### initialState

reducer 切片的初始值，因为 rd-model 内部使用了 [immer](https://immerjs.github.io/immer/zh-CN/) 来实现数据不可变，所以，数据模型的初始值必须是一个引用值，而不是简单值。

> 如果你的 reducer 切片数据仅仅只是一个 `number`,`string` 等简单值，那大可不必使用一个数据模型来管理它。

#### reducers

一个 `key-value` 对象, 类型定义如下:

```typescript
type CaseReducers = {
  [key: string]: (state, action:PayloadAction<any>) => void 
};
```

这实际上是对 reducer 函数 `switch-case` 写法的升级，**每个 key 对应的方法代表对当前切片数据的一种修改。**

这些方法会使用 [immer](https://immerjs.github.io/immer/zh-CN/) 进行包装，所以你可以在函数内直接对 state 进行赋值修改，无需像以往一样通过拓展语法去返回一个新的对象。

rd-model 可以由该对象计算出最终的 reducer 方法，以及生成对应的 actionDispatcher 方法。 

> 你需要对 action 参数通过 `PayloadAction` 指定类型来帮助 rd-model 进行类型推导。

#### fetch

指定模型对象中某个字段数据的获取方法(异步)。如果数据模型中某个字段的值是通过**非分页请求**获取的，那么你可以通过 fetch 字段进行配置。

```tsx

/** redux 定义 **/
type BusinessData = {/*...*/}

const dataModel = createModel({
  initialState: {
    // 其他字段 。。。
    businessData: null as BusinessData,
  },
  // 其他配置 。。。
  fetch: {
    // 定义 businessData 的获取方法
    businessData: fetchBusinessData, // as (id: string) => Promise<BusinessData>
  }
});


/** 业务组件 **/
import { isPending } from 'rd-model';

function BusinessComponent(props) {
  
  useEffect(() => {
    // 直接调用 fetch.businessData
    // rd-model 内部会自动维护加载状态的更新
    dataModal.fetch.businessData(props.id);
  }, [props.id]);

  // 状态数据订阅
  const businessData = dataModal.useModel(state => state.businessData);

  // 通过 isPending 直接判定是否处于加载中状态。
  if (isPending(businessData) || !businessData) {
     return <Loading />
  }
  return <Display data={businessData} />
}
```

#### 持久化缓存

当你不希望某些 Redux 数据随着页面刷新就丢失时，你就可以通过将它们下沉到 `localStorage`或 `sessionStorage` 中，以达到持久化的目的。`createModel` 提供了三个用于持久化缓存的字段:

- `cacheStorage?: 'session'|'local'|Storage;`：配置存储对象。
- `cacheKey?: string;`： 存储用的 key 值，需要维护其唯一性。
- `cacheVersion?: string;`：缓存的版本号，一般用于避免代码版本的升级导致数据结构的冲突。

#### extraReducers

订阅当前切片外的动作。

```typescript
const dataModel = createModel({
  initialState,
  // other config ...
  extraReducers: {
    "root-reset": (state, action) => {
      return initialState;
    }
  }
});
```

### Model

Model 对象包含对当前 reducer 切片状态数据的所有订阅和更新方法。它拥有完善的类型提醒，使用也非常简单。

```typescript
type Selector<S, s> = (state: S) => s;
type UseModelOption = {
  withSuspense?: boolean | ((subState: any) => boolean);
  eq?: (a, b) => boolean;
};
type Model<STATE> = {
  /** 获取切片状态数据 */
  getState: () => STATE;
  /** 组件内订阅切片状态数据 */
  useModel: <T>(selector: Selector<STATE, T>, options?: UseModelOption) => T;
  /** actions dispatchers */
  actions: Record<string, Function>;
  /** data fetchers */
  fetch: Record<string, PromiseFn>;
  /** pure reducer functions */
  reducer: Reducer<STATE>;
}
```

#### getState

获取当前 reducer 切片的状态数据。

#### useModel

在函数组件内订阅当前 reducer 切片的状态数据。在所订阅的状态发生变化时更新当前组件。默认使用浅对比判断状态是否变化。

`useModel` 与 `useSelector` 方法的用法是一致的。区别在于它们订阅的数据范围不同，`useModel` 是当前切片状态，`useSelector`是全局状态。

```tsx
const dataModel = createModel({
  initialState: {
    // other...
    businessData: null as BusinessData,
  },
  // other config ...
  fetch: {
    businessData: fetchBusinessData, // () => Promise<BusinessData>
  }
});

function Children() {
  // 订阅切片状态数据
  const businessData = dataModel.useModel(
    state => state.businessData,
    { withSuspense: true }
  );
  return (<Display data={businessData} />)
}

function Parent() {
  useLayoutEffect(() => {
    dataModel.fetch.businessData()
  }, []);
  return (
    <Suspense fellback={<Loading/>}>
      <Children />
    </Suspense>
  )
}

```

当用 `model.fetch.xxx` 去获取异步数据时，`withSuspense` 配置能减少不少判定逻辑。

因为使用 `withSuspense` 配置后，当数据处于加载中状态时它会抛出一个 Promise 异常，这个 Promise 会等待加载中状态结束时进行 resolve。 配合 `React.Suspense` 就可以像获取同步数据一样获取异步数据。

#### actions

actions 对象包含了当前 reducer 切片的所有动作派发函数(不需要额外的 connect 就可以直接派发动作)。该对象由 reduces 配置推导而出:

```typescript
// reducers 定义
type Reducers = {
  setNum: (state, action: PayloadAction<number>) => void;
  reset: (state) => void;
};
// 推导出
type Actions = {
  setNum: (p: number) => void;
  reset: () => void;
}
```

#### fetch

状态数据加载方法集合对，拥有与 [`fetch`](#fetch) 配置对象一样的类型签名，用于获取异步数据。它除了会自动维护数据的加载状态外，还处理了数据竞争的问题。

> 数据竞争说明: 用户不断变更筛选条件，导致发起多次筛选请求，但这些请求最终都是作用于同一个数据，这个时候，数据的最终结果会变得不可控，网络抖动会导致请求的返回顺序与发起顺序不一致，最终导致界面会展示最慢返回的请求数据，这与用户的期待是不一致的。
> 
> 虽然使用截流函数能减少此类问题的概率，但是并不能完全杜绝出现的可能性。

#### reducer

一个纯的 reducer 函数，由 reducers 配置生成，**为了让 model 对象能够正常使用**，需要将它合并到正确的位置上，详见 [`statePaths` 配置](#statepaths)。

