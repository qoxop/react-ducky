import React from 'react';
import { FunctionLike } from '../typings';
import { isFunction } from '../utils/is-type';
import { PageAction, getCurrentPageAction } from '../utils/history';

const {
  useState,
  useEffect,
} = React;

/**
 * 增强路由组件，给页面级组件的路由事件回调提供切入点。
 * @param Component
 * @param opt
 * @returns
 */
function withPageHook<T = FunctionLike<[any], any>>(
  Component: T,
  opt: {
    onEnter?: FunctionLike<[PageAction?], void>;
    onLeave?: FunctionLike<[PageAction?], void>;
  },
): T {
  const { onEnter, onLeave } = opt;
  const WithHookComponent:React.FC = (props) => {
    const [canRender, setCanRender] = useState(false);
    useEffect(() => { 
      // 延后渲染, 确保相关工作执行完毕
      Promise.resolve().then(() => setCanRender(true));
      if (isFunction(onEnter)) {
        onEnter(getCurrentPageAction());
      }
      return () => {
        Promise.resolve().then(() => {
          if (isFunction(onLeave)) {
            onLeave(getCurrentPageAction());
          }
        });
      }
    }, []);
    if (canRender) {
      // @ts-ignore
      return <Component {...props} />;
    }
    return null;
  };
  return WithHookComponent as unknown as T;
}

export {
  withPageHook,
};
