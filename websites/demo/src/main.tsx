import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { App } from "./app";
import { Provider } from "./provider";
import './style.less';


const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <Provider>
    <App />
  </Provider>
);