<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [rd-model](./rd-model.md) &gt; [createModel](./rd-model.createmodel.md)

## createModel() function

创建一个基于 Redux 的状态模型

<b>Signature:</b>

```typescript
declare function createModel<STATE extends Record<string, any>, MCRA extends ModelCaseReducerActions<STATE>, SIF extends InferModelFetch<STATE> = {}>(options: CreateModelOptions<STATE, MCRA, SIF>, getStore?: () => Store): Model<STATE, MCRA, SIF>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | CreateModelOptions&lt;STATE, MCRA, SIF&gt; | 配置对象 [CreateModelOptions](./rd-model.createmodeloptions.md) |
|  getStore | () =&gt; Store | <i>(Optional)</i> 获取 <code>redux store</code> 的方法，多 redux 实例时使用 |

<b>Returns:</b>

Model&lt;STATE, MCRA, SIF&gt;

返回状态模型 [Model](./rd-model.model.md)

