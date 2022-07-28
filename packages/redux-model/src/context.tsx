/**
 * 提供用于获取 store 对象和订阅器的 Provider 和 Context
 */
import React, {
  useRef,
  createContext,
  useLayoutEffect,
} from 'react';
import { Store } from 'redux';
import { getStore, setStore } from './store';
import { ReduxSubscriber } from './subscriber';

/**
 * ReduxContext
 */
const ReduxContext = createContext<{store: Store, subscriber: ReduxSubscriber }>({} as any);

/**
 * ReduxProvider
 */
const ReduxProvider:React.FC<{ store: Store, children: any }> = ({
  store,
  children,
}) => {
  const contextValueRef = useRef({store, subscriber: null as unknown as ReduxSubscriber});
  if (!contextValueRef.current.subscriber) {
    try {
      getStore();
    } catch (error) {
      setStore(store);
    }
    contextValueRef.current.subscriber = new ReduxSubscriber(store);
  }
  useLayoutEffect(() => {
    // https://github.com/facebook/react/issues/24425
    contextValueRef.current.subscriber.startListen();
    return contextValueRef.current.subscriber.destroy.bind(contextValueRef.current.subscriber);
  }, [contextValueRef]);
  return (
    <ReduxContext.Provider value={contextValueRef.current}>
      {children}
    </ReduxContext.Provider>
  );
};

export {
  ReduxContext,
  ReduxProvider,
};
