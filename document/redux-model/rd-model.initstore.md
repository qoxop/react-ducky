<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [rd-model](./rd-model.md) &gt; [initStore](./rd-model.initstore.md)

## initStore() function

初始化 redux store

<b>Signature:</b>

```typescript
declare function initStore<STATE extends DefaultRootState>(options: InitStoreOption): {
    updateReducer: (reducers: ReducerRecord, force?: boolean) => void;
    store: Store<STATE, AnyAction>;
};
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | InitStoreOption |  |

<b>Returns:</b>

{ updateReducer: (reducers: ReducerRecord, force?: boolean) =&gt; void; store: Store&lt;STATE, AnyAction&gt;; }

