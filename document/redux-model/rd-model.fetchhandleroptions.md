<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [rd-model](./rd-model.md) &gt; [FetchHandlerOptions](./rd-model.fetchhandleroptions.md)

## FetchHandlerOptions type

异步请求处理器配置参数

<b>Signature:</b>

```typescript
declare type FetchHandlerOptions<Args extends any[], Resp = any> = {
    fetcher: PromiseFn<Resp, Args>;
    after?: (result: [Resp | null, Args, any]) => void;
    before?: (...args: Args) => void;
    identifier?: (...args: Args) => string;
};
```
