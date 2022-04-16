import React from "react";
import ReactDom from "react-dom";
import { App } from "./app";
import { Provider } from "./provider";
import { enhanceHistory } from '../src'

enhanceHistory();

window.addEventListener('routeAction', e => console.log(e['_routeAction']));

ReactDom.render(<Provider><App /></Provider>, document.getElementById('root'));