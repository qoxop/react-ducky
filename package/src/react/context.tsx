import React, { useRef } from 'react';
import { Store } from 'redux';
import { setStore } from '../redux/store';
import { ReduxSubscriber } from '../helper/state-subscriber';
import { PageAction } from '../utils/history';
import { useSelector } from './hooks';

const {
  createContext,
  useLayoutEffect,
} = React;

const ReduxContext = createContext<{store?: Store, subscriber?: ReduxSubscriber }>({});

const ReduxProvider:React.FC<{ store: Store, children: any, setDefault?: boolean }> = ({
  store,
  children,
  setDefault = false
}) => {
  const contextValueRef = useRef({store, subscriber: null as ReduxSubscriber});
  if (!contextValueRef.current.subscriber) {
    if (setDefault) {
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

const PageActionContext = createContext<PageAction>('replace');

/**
 * 提供路由跳转信息
 */
const PageActionProvider:React.FC<{children: any}> = ({ children }) => {
  const { method } = useSelector(state => state._CURRENT_ROUTE) || {};
  return (
    <PageActionContext.Provider value={method}>
      {children}
    </PageActionContext.Provider>
  );
};

/**
 * DuckyProvider
 */
const DuckyProvider:React.FC<{children: any, store: Store}> = ({ store, children }) => (
  <ReduxProvider store={store} setDefault={true}>
    <PageActionProvider>{children}</PageActionProvider>
  </ReduxProvider>
);

export {
  ReduxContext,
  ReduxProvider,
  DuckyProvider,
  PageActionContext,
  PageActionProvider,
};
