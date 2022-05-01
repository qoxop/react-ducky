import React from 'react';
import { HashRouter } from 'react-router-dom'
import { DuckyProvider, initStore, historyMiddleware } from 'react-ducky';

export const {
  store,
  updateReducer,
} = initStore({
  isDev: true,
  middleware: [historyMiddleware],
});

export const Provider:React.FC<{children: any}> = ({ children }) => {
  return (
    <DuckyProvider store={store}>
      <HashRouter>
        {children}
      </HashRouter>
    </DuckyProvider>
  )
}