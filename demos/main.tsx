import React from 'react';
import ReactDOM from 'react-dom';
import { ReduxProvider } from 'rtk-like';
import { store } from './store';
import App from './App';


ReactDOM.render(
    <React.StrictMode>
      <ReduxProvider store={store}>
        <React.Suspense fallback={<div>loading...</div>}>
          <App />
        </React.Suspense>
      </ReduxProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
