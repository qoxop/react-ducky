# rc-controller

在函数组件中使用 hook 可以方便地封装和复用逻辑，但当业务逻辑变得复杂时，代码可能会变得不简洁甚至混乱，某些处理方法不得不定义在组件内，随着组件更新重复地创建。同时为了性能问题，可能需要使用的 useCallback 对函数进行包裹(同时还需要时刻注意闭包问题, 常常需要用 ref 保存引用)。

rc-controller 提供了一种 `class + hook` 的方式来编写你的业务逻辑。用 Class 组织和封装函数组件中用于处理业务逻辑的方法，减少 useCallback、ref 的使用，避免函数的重复创建，同时让代码更加简洁。

## 使用示例

```tsx
/**
 * 使用 Controller 封装业务逻辑、输出数据
 */
class ListController extends Controller<State, Props> {
  // 初始化
  state = { list: [], filter: {} }
  constructor(props) {
    super(props);
  }

  /**
   * 使用 hooks 执行副作用、输出数据
   */
  public useHooks() {
    const { sort } = this.props;
    const { list, filter } = this.state;
    const sortedList = useMemo(() => list.sort(sort), [list, sort]);
    useEffect(() => {
      this.fetchList(filter)
    }, [filter]);
    return { list: sortedList, filter };
  }

  /**
   * 获取列表(防抖)
   */
  private fetchList = debounce((filter: Filter) => {
    const list = await apiFetchList(filter);
    this.setState({ list });
  }, 300);

  /**
   * 更新筛选条件
   */
  public updateFilter = (filter: Partial<Filter>) => {
    this.setState({ filter })
  }
}

/**
 * 业务组件使用 Controller 链接UI组件与业务逻辑
 */
function ListComponent(props: any) {
  const [ctrl, { list, filter }] = useController(ListController, props);
  return (
    <div>
      <Filter value={filter} onChange={ctrl.updateFilter} />
      <List value={list} />
    </div>
  )
}
```
## API
### Controller

Controller 是一个基类，内置了一些特殊的方法来模拟 class 组件的行为。

使用者通过编写继承此基类来组织业务逻辑方法，而组件内部通过 useController 对其进行实例化，并将实例方法传递给相关的事件回调。从而达到简化组件逻辑的目的。

```typescript
class MyController extends Controller<State, Props> {
  constructor(props) {
    super(props);
    // init logic
  }
  /**
   * @override
   */
  public useHooks(): any {
    return {};
  }
  // 定义方法
  public CustomMethod() {
    // 可以使用 this.setState、this.state、this.props 等属性和方法
  }
}
```

### useController

useController 用于将自定义的 Controller 类进行实例化。`useController` 接受两个参数：

- 一个继承了 `Controller` 的类
- 组件的 `props` 值

并返回一个元组，分别对应 `Controller` 的实例和实例内 `useHooks` 的返回值。

`useController`只会对 `Controller` 实例化一次，但是每次组件更新都会调用实例的 `useHooks`方法，使得在 `useHooks` 内部使用 `hook` 与在组件闭包内使用时的效果保持一致。

### ReduxController

为了跟方便地使用与 Redux 配合使用，rc-controller 同时提供了 `ReduxController` 类，对应的，它需要通过调用 `useReduxController` 这个 hook 在函数组件中使用。

其使用方法 `Controller` 并无差异，只是实例内部增加了 `store`、`dispatch` 属性，用于获取 Redux中的数据以及派发动作。

> rc-controller 内部没有提供 `useReduxController` 这个方法，需要使用者调用 `createUseReduxController` 这个方法生成，因为 rc-controller 内部不直接依赖于 redux。

---
[完整 API 文档地址](../../document/react-controller/)