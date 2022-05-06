import React from 'react';
import { Store } from 'redux';
import { setStore } from '../redux/store';
import { ReduxSubscriber } from '../helper/state-subscriber';

const {
  useRef,
  createContext,
  useLayoutEffect,
} = React;

/**
 * ReduxContext
 */
const ReduxContext = createContext<{store?: Store, subscriber?: ReduxSubscriber }>({});

/**
 * ReduxProvider
 */
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

/**
 * DuckyProvider
 */
const DuckyProvider:React.FC<{children: any, store: Store}> = ({ store, children }) => (
  <ReduxProvider store={store} setDefault={true}>
    {children}
  </ReduxProvider>
);

export {
  ReduxContext,
  ReduxProvider,
  DuckyProvider,
};
