import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'rtk-like';
import { store } from './store';
import App from './App';


ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <React.Suspense fallback={<div>loading...</div>}>
          <App />
        </React.Suspense>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
)
