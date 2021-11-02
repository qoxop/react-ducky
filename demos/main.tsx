import React from 'react'
import ReactDOM from 'react-dom'
import { ReduxProvider } from 'react-ducky';
import { store } from './store'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
