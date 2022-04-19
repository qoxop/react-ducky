import React from 'react';
import { HashRouter } from 'react-router-dom'
import { ReduxProvider, initStore, enhanceHistory, PageActionProvider } from 'react-ducky';
import { compose } from 'redux';

enhanceHistory()

const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
  compose;

export const {
  store,
  updateReducer,
} = initStore({enhancer: composeEnhancers()});

export const Provider:React.FC = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <PageActionProvider>
        <HashRouter>
          {children}
        </HashRouter>
      </PageActionProvider>
    </ReduxProvider>
  )
}