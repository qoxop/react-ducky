import React from "react";
import ReactDom from "react-dom";
import { App } from "./app";
import { Provider } from "./provider";
import { enhanceHistory } from 'react-ducky'
import './style.less';

enhanceHistory();

window.addEventListener('pageAction', e => console.log(e['_pageAction']));

ReactDom.render(<Provider><App /></Provider>, document.getElementById('root'));