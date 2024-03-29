<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [rd-model](./rd-model.md) &gt; [useSelector](./rd-model.useselector.md)

## useSelector() function

订阅 Redux 的状态数据

<b>Signature:</b>

```typescript
declare function useSelector<S = DefaultRootState, P = any>(selector: Selector<S, P>, options?: UseSelectorOptions<P>): P;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  selector | [Selector](./rd-model.selector.md)<!-- -->&lt;S, P&gt; | 数据选择器函数 [Selector](./rd-model.selector.md) |
|  options | UseSelectorOptions&lt;P&gt; | <i>(Optional)</i> 配置选项 [UseSelectorOptions](./rd-model.useselectoroptions.md) |

<b>Returns:</b>

P

