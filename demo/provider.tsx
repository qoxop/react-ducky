import React from 'react';
import { HashRouter } from 'react-router-dom'
import { ReduxProvider, initReduxStore } from '../src';

export const {
  store,
  updateReducer,
} = initReduxStore({}, {})

export const Provider:React.FC = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <HashRouter>
        {children}
      </HashRouter>
    </ReduxProvider>
  )
}