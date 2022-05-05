---
sidebar_position: 2
---

# 缓存控制

缓存的使用对于 Web 应用的性能优化和体验提升来说有很大的帮助。但缓存的控制却不是一件简单的事情，需要解决很多的问题，比如: 何时使用缓存、缓存的过期设置、如何及时清除过期的缓存避免占用过多的内存等等。所幸的是，在某些场景下，缓存的控制逻辑有通用性，比如页面级的缓存。

## 页面缓存
我们知道，浏览器的路由跳转大体上可以分为四种方式: 

- `push`: **将路由栈中排在当前路由指针之后的路由全部推出**，然后往路由栈中新增一个路由，并跳转到新的路由。
- `replace`: 用新的路由替换路由指针指向的路由(当前路由)，并跳转到新的路由。
- `goBack`: 将路由指针指向路由栈的上一个路由，并跳转到该路由。
- `forward`: 将路由指针指向路由栈的下一个路由，并跳转到该路由。

React-ducky 提供了一个与浏览器路由栈行为一致的缓存管理方案: **当某个页面对应的路由从路由栈中被推出时，它的缓存也会被清除**。

也就是说，当你某个页面上新建了一份缓存数据后，如果你通过 `forward` 和 `goBack` 的方式重新访问该页面，那么这个缓存数据依然有效，如果使用其他的方式，缓存就会失效。

## 与 [History.state](https://developer.mozilla.org/zh-CN/docs/Web/API/History/state) 的区别

区别在于：History.state 是只读的，而且必须是由上一个路由传入。而 React-ducky 提供的缓存方案是允许你在当前页面的运行时对缓存数据进行写入和修改的。

这里有一个运用该方案的[实际示例](https://www.hhhhhhh.com)。

## 示例代码

尝试编写一个记住滚动位置的 hook:

```tsx {6,13-15}
import { usePageState } from 'react-ducky'
import { useRef, useCallback, useEffect } from 'react';

export const useMemoriesScroll = (key: string = "memo-scroll") => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = usePageState(0, key);

  const handleScroll = useCallback((event) => {
    setScrollTop(event.currentTarget.scrollTop, true);
  }, [setScrollTop]);

  useEffect(() => {
    if (boxRef.current && scrollTop) {
      boxRef.current.scrollTop = scrollTop;
    }
  }, []);
  return [handleScroll, boxRef];
}
```