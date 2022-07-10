import {
  useRef,
  useMemo,
  useEffect,
  useContext,
  useReducer,
} from 'react';
import { ReduxContext } from './context';
import {
  shallowEqual,
  isPending,
  outPromise,
  isFunction
} from './utils';
import {
  IsEqual,
  Selector,
  FunctionLike,
  DefaultRootState,
} from '../typings';

/**
 * useSelector 的配置对象
 * @remarks
 * 类型说明:
 * ```ts
 * type UseSelectorOptions = {
 *  // 是否同步订阅(redux 值一更新就马上执行组件的 update 操作)，默认为 false
 *  sync?: boolean;
 *  // 对比方法
 *  eq?: IsEqual<P>;
 *  // 是否与 React.Suspense 配合使用
 *  withSuspense?: boolean | FunctionLike<[P], boolean>;
 * }
 * ```
 */
type UseSelectorOptions<P> = {
  /**
   * 同步订阅，redux 值一更新就马上执行组件的 update 操作，默认为 false
   */
  sync?: boolean;
  /**
   * 对比方法
   */
  eq?: IsEqual<P>;
  /**
   * 是否与 React.Suspense 配合使用
   */
  withSuspense?: boolean | FunctionLike<[P], boolean>;
}

/**
 * 获取 Redux 的 Store 对象
 * @returns
 */
const useStore = () => (useContext(ReduxContext).store);

/**
 * 获取 Redux 的 Dispatch 方法
 * @returns
 */
 const useDispatch = () => (useContext(ReduxContext).store.dispatch);

/**
 * 订阅 Redux 的状态数据
 * @param selector 数据选择器函数 {@link Selector}
 * @param options 配置选项 {@link UseSelectorOptions}
 */
function useSelector <S = DefaultRootState, P = any>(
  selector: Selector<S, P>,
  options: UseSelectorOptions<P> = {}
): P {
  const { eq, withSuspense, sync } = useMemo(() => ({
    eq: options.eq || shallowEqual,
    sync: options.sync,
    withSuspense: options.withSuspense === true
      ? isPending
      : (isFunction(options.withSuspense) ? options.withSuspense : null),
  }), []);
  const { subscriber, store } = useContext(ReduxContext);
  const [forceTimes, forceRender] = useReducer((s) => s + 1, 0);
  const subState = useMemo(() => selector(store.getState()), [store, forceTimes]);
  const subStateRef = useRef<P>(subState);

  // 添加订阅
  useEffect(() => {
    const symbolKey = Symbol('use-selector');
    const _newSubState = selector(store.getState());
    if (!eq(_newSubState, subStateRef.current)) {
      Promise.resolve().then(forceRender);
      subStateRef.current = _newSubState;
      
    }
    subscriber.add(symbolKey, (appState) => {
      const newSubState = selector(appState);
      if (!eq(newSubState, subStateRef.current)) {
        subStateRef.current = newSubState;
        forceRender();
      }
    }, { sync });
    return () => subscriber.remove(symbolKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  if (withSuspense) {
    // 判断是否为 pending，如果是 pending 抛出一个 promise 的异常
    if (withSuspense(subState)) {
      const { promise, resolve } = outPromise<P>();
      const symbolKey = Symbol('with-suspense');
      subscriber.add(symbolKey, (appState) => {
        const newSubState = selector(appState);
        if (!withSuspense(newSubState)) {
          resolve(newSubState);
          return true;
        }
      }, { once: true });
      throw promise;
    }
  }
  return subState;
};


export {
  useStore,
  useDispatch,
  useSelector,
};

export type {
  UseSelectorOptions,
};
