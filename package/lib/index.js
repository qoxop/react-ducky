"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var t=require("immer"),e=require("redux"),r=require("react");function n(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var o=n(t),u=n(r),i=function(t,e){return i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r])},i(t,e)};function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function r(){this.constructor=t}i(t,e),t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)}var a=function(){return a=Object.assign||function(t){for(var e,r=1,n=arguments.length;r<n;r++)for(var o in e=arguments[r])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},a.apply(this,arguments)};function s(t,e,r,n){return new(r||(r=Promise))((function(o,u){function i(t){try{a(n.next(t))}catch(t){u(t)}}function c(t){try{a(n.throw(t))}catch(t){u(t)}}function a(t){var e;t.done?o(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(i,c)}a((n=n.apply(t,e||[])).next())}))}function f(t,e){var r,n,o,u,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return u={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(u[Symbol.iterator]=function(){return this}),u;function c(u){return function(c){return function(u){if(r)throw new TypeError("Generator is already executing.");for(;i;)try{if(r=1,n&&(o=2&u[0]?n.return:u[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,u[1])).done)return o;switch(n=0,o&&(u=[2&u[0],o.value]),u[0]){case 0:case 1:o=u;break;case 4:return i.label++,{value:u[1],done:!1};case 5:i.label++,n=u[1],u=[0];continue;case 7:u=i.ops.pop(),i.trys.pop();continue;default:if(!(o=i.trys,(o=o.length>0&&o[o.length-1])||6!==u[0]&&2!==u[0])){i=0;continue}if(3===u[0]&&(!o||u[1]>o[0]&&u[1]<o[3])){i.label=u[1];break}if(6===u[0]&&i.label<o[1]){i.label=o[1],o=u;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(u);break}o[2]&&i.ops.pop(),i.trys.pop();continue}u=e.call(t,i)}catch(t){u=[6,t],n=0}finally{r=o=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,c])}}}var l,p=window.dispatchEvent.bind(window),d=window.addEventListener.bind(window),v=JSON.parse,h=JSON.stringify,y=window.history,b=window.localStorage,w=window.sessionStorage,g=function(t){return Array.isArray?Array.isArray(t):"[object Array]"===function(t){return Object.prototype.toString.call(t)}(t)},m=function(t){return"function"==typeof t},_=function(t){return null!==t&&"object"==typeof t},S=function(t){return _(t)&&m(t.then)&&m(t.catch)},O=function(t,e){if(t===e)return!0;if(e&&t&&"object"==typeof e&&"object"==typeof t){var r=Object.keys(e);return r.every((function(r){return e[r]===t[r]}))&&r.length===Object.keys(t).length}return!1},x=(l=0,function(){return"u_".concat(l++).concat(Date.now().toString(36))}),E=function(t){return{get:function(){try{var e=w.getItem(t);return e?v(e).v:null}catch(t){return null}},set:function(e){w.setItem(t,h({v:e}))}}},P=!1,C="replace",j=x(),R=function(){return C},k=function(){var t;return(null===(t=y.state)||void 0===t?void 0:t._key_)||j},I=function(t,e){var r=e||k(),n=w.getItem(r);if(n)try{return v(n).v}catch(t){console.warn(t)}return m(t)?t():t},N=function(t,e){var r=e||k();t.idx&&t.key?t.usr&&w.setItem(r,h({v:t.usr})):w.setItem(r,h({v:t}))},T=function(t){return t&&t.idx&&t.key?t.key:x()},A=function(t,e){var r;return!e||-1===(null==t?void 0:t._key_)||-1===(null===(r=null==t?void 0:t.usr)||void 0===r?void 0:r._key_)},U=function(){if(!P){var t=E("$route_stack"),e=t.get()||[k()],r={pushState:function(r){var n=k(),o=e.findIndex((function(t){return t===n}));if(o>-1){var u=e.splice(o+1,e.length-o-1,r);setTimeout((function(){for(var t=Object.keys(w),e=0,r=u;e<r.length;e++){for(var n=r[e],o=[],i=0,c=t;i<c.length;i++){var a=c[i];0===a.indexOf(n)?w.removeItem(a):o.push(a)}t=o}}),1e3/60)}else e.push(r);t.set(e)},replaceState:function(r){var n=k(),o=e.findIndex((function(t){return t===n}));e[o]=r,t.set(e)}},n=k(),o=function(t){var r=k();switch(t){case"pushState":C="push";break;case"replaceState":C="replace";break;default:var o=e.findIndex((function(t){return t===n})),u=e.findIndex((function(t){return t===r}));C=o>u?"goBack":"forward"}var i=new Event("pageAction");i["_".concat("pageAction")]=C,p(i),n=r};y.pushState=u("pushState"),y.replaceState=u("replaceState"),d("popstate",(function(){return o("popstate")})),P=!0}function u(t){var e=y[t];return function(n,u,i){var c=function(t,e){return a(a({},t),{_key_:A(t,e)?k():T(t)})}(n,i);n&&N(n,c._key_),null!=i?(r[t](c._key_),e.call(this,c,u||"",i)):e.call(this,c,u||"",i),o(t)}}},D=Object.freeze({__proto__:null,EventName:"pageAction",getPageId:k,getPageState:I,setPageState:N,enhanceHistory:U,getCurrentPageAction:R});function L(t,e,r){this.valueOf=function(){return t},"string"==typeof t&&(this.toString=function(){return t}),this[e]=r}var $=function(t,e,r){var n;return t&&"object"==typeof t?Object.assign(g(t)?[]:{},t,((n={})[e]=r,n)):new L(t,e,r)};var q=null,H=function(){return function(){if(!q)throw new Error("Store 未初始化");return!0}()&&q},M=function(t){return q=t},G=function(t,r){var n=r&&Object.keys(r).length?e.combineReducers(r):function(t){return t};return function(e,r){if("ROUTE-CHANGED"===r.type)return a(a({},e),{_CURRENT_ROUTE:r.payload});var o=e._CURRENT_ROUTE,u=function(t,e){var r={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.indexOf(n)<0&&(r[n]=t[n]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(n=Object.getOwnPropertySymbols(t);o<n.length;o++)e.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(t,n[o])&&(r[n[o]]=t[n[o]])}return r}(e,["_CURRENT_ROUTE"]);return a(a({},t[r.type]?t[r.type](u,r):n(u,r)),{_CURRENT_ROUTE:o})}};var V,X=function(){function t(){this.equal={},this.match=[]}return t.prototype.addCase=function(t,e){return this.equal[t]?console.warn("action type duplicate ~"):this.equal[t]=e,this},t.prototype.addMatcher=function(t,e){return this.match.push({reducer:e,matcher:t}),this},t.prototype.addDefaultCase=function(t){return this.default=t,this},t}();function K(){var t={resolve:null,reject:null,promise:null};return t.promise=new Promise((function(e,r){t.resolve=e,t.reject=r})),t}function B(t){return s(this,void 0,void 0,(function(){return f(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,t];case 1:return[2,[e.sent(),null]];case 2:return[2,[null,e.sent()]];case 3:return[2]}}))}))}function J(t){var e=this,r=t.fetcher,n=t.after,o=t.before,u=t.identifier,i={};return function(){for(var t=[],c=0;c<arguments.length;c++)t[c]=arguments[c];return s(e,void 0,void 0,(function(){var e,c,a,s,l,p;return f(this,(function(f){switch(f.label){case 0:return e=u?u.apply(void 0,t):"def",c=r.apply(void 0,t),o&&o.apply(void 0,t),i[e]=(i[e]||0)+1,a=i[e],[4,B(c)];case 1:if(s=f.sent(),l=s[0],p=s[1],a===i[e]){if(n&&n([l,t,p]),p)throw p;return[2,l]}throw new Error("invalid response ~")}}))}))}}!function(t){t[t.LOADING=1]="LOADING",t[t.UNACTIVE=2]="UNACTIVE"}(V||(V={}));var z=Symbol("PENDING_KEY"),F=function(t){return!(!t||!0!==t[z])},Y=function(t,e){return e?$(t,z,!0):function(t,e){var r;return t&&e in t&&delete t[e],null!==(r=null==t?void 0:t.valueOf())&&void 0!==r?r:t}(t,z)},Q=function(t){function e(e){var r=t.call(this)||this;return r.getState=function(t){return t?t(r.store.getState()):r.store.getState()},r.store=e,r.startListen(),r}return c(e,t),e.prototype.startListen=function(){var t,e=this;this.unsubscribe||(this.unsubscribe=this.store.subscribe((function(){e.emit(e.store.getState(),!0);var r=t=function(){return e.emit(e.store.getState(),!1)};Promise.resolve().then((function(){t===r&&t()}))})))},e.prototype.destroy=function(){this.clear(),this.unsubscribe&&this.unsubscribe(),this.unsubscribe=null},e}(function(){function t(){this.listeners=new Map}return t.prototype.emit=function(t,e){this.listeners.forEach((function(r,n,o){if(!!r.sync===e){var u=r.callback(t);r.once&&u&&o.delete(n)}}))},t.prototype.add=function(t,e,r){this.listeners.set(t,a({callback:e},r))},t.prototype.remove=function(t){this.listeners.delete(t)},t.prototype.has=function(t){return this.listeners.has(t)},t.prototype.clear=function(){this.listeners.clear()},t}()),W=u.default.useRef,Z=u.default.createContext,tt=u.default.useLayoutEffect,et=Z({}),rt=function(t){var e=t.store,r=t.children,n=t.setDefault,o=void 0!==n&&n,i=W({store:e,subscriber:null});return i.current.subscriber||(o&&M(e),i.current.subscriber=new Q(e)),tt((function(){return i.current.subscriber.startListen(),i.current.subscriber.destroy.bind(i.current.subscriber)}),[i]),u.default.createElement(et.Provider,{value:i.current},r)},nt=u.default.useState,ot=u.default.useReducer,ut=u.default.createContext,it=Symbol?Symbol("$setState"):"$__controller_$_set_state",ct=Symbol?Symbol("$forceUpdate"):"$__controller_$_force_update",at=Symbol?Symbol("$classHooks"):"$__controller_$_class_hooks",st=Symbol?Symbol("$bindThis"):"$__controller_$_bind_this";var ft=function(){function e(t){var e=this;this.state={},this.props={},this.setState=function(t){return e[it](t)},this.forceUpdate=function(){return e[ct]()},t&&(this.props=t),this[st]&&this[st](this)}return e.prototype.useHooks=function(){return{}},e.prototype[at]=function(e){var r=nt(this.state),n=r[0],o=r[1];this[ct]=ot((function(t){return t+1}),0)[1],this.state=n,this.props=e,this[it]||(this[it]=function(e){o("function"==typeof e?t.produce(e):function(t){return a(a({},t),e)})})},e.Context=ut(null),e}(),lt=function(t){function e(e,r){var n=t.call(this,r)||this;return n.store=e,n.dispatch=e.dispatch,n}return c(e,t),e}(ft),pt=u.default.useRef,dt=u.default.useMemo,vt=u.default.useEffect,ht=u.default.useContext,yt=u.default.useReducer,bt=u.default.useCallback;function wt(t,e){void 0===e&&(e={});var r=dt((function(){return{eq:e.eq||O,sync:e.sync,withSuspense:!0===e.withSuspense?F:m(e.withSuspense)?e.withSuspense:null}}),[]),n=r.eq,o=r.withSuspense,u=r.sync,i=ht(et),c=i.subscriber,a=i.store,s=yt((function(t){return t+1}),0),f=s[0],l=s[1],p=dt((function(){return t(a.getState())}),[a,f]),d=pt(p);if(vt((function(){var e=Symbol("use-selector"),r=t(a.getState());return n(r,d.current)||(Promise.resolve().then(l),d.current=r),c.add(e,(function(e){var r=t(e);n(r,d.current)||(d.current=r,l())}),{sync:u}),function(){return c.remove(e)}}),[a]),o&&o(p)){var v=K(),h=v.promise,y=v.resolve,b=Symbol("with-suspense");throw c.add(b,(function(e){var r=t(e);if(!o(r))return y(r),!0}),{once:!0}),h}return p}function gt(t){var e=pt(t);return e.current!==t&&(e.current=t),e}function mt(t){var e=yt((function(t){return t+1}),0);e[0];var r=e[1],n=pt(function(t){return m(t)?t():t}(t)),o=bt((function(t,e){m(t)?n.current=t(n.current):n.current=t,e||r()}),[]);return[n.current,o,n]}var _t=function(t){if(t.cacheKey){var e=t.cacheKey,r=t.cacheStorage,n=void 0===r?"session":r,o=null;return{storeItem:o="session"===n?E(e):function(t,e,r){var n={get:function(){try{var r=t.getItem(e);return r?v(r).v:null}catch(t){return null}},set:function(n){t.setItem(e,h({v:n,h:r}))}};try{v(t.getItem(e)||"{}").h!==r&&n.set(null)}catch(t){n.set(null)}return n}("local"===n?b:n,e,t.cacheVersion||h(t.initialState)),state:o.get()||t.initialState}}return{storeItem:null,state:t.initialState}};var St=u.default.useState,Ot=u.default.useEffect;exports.Builder=X,exports.Controller=ft,exports.DuckyProvider=function(t){var e=t.store,r=t.children;return u.default.createElement(rt,{store:e,setDefault:!0},r)},exports.ReduxContext=et,exports.ReduxController=lt,exports.ReduxProvider=rt,exports.alwayResolve=B,exports.createFetchHandler=J,exports.createModel=function(e,r){void 0===r&&(r=H);for(var n,u,i,c=e.statePaths,s=e.reducers,f=e.fetch,l=e.extraReducers,p=c.join("_").toUpperCase(),d=(n=c,void 0===u&&(u=null),function(t){for(var e=t,r=0,o=n;r<o.length;r++){var i=o[r];if(!e)return u;e=e[i]}return e}),v=function(){return r().dispatch},h={},y={},b=_t(e),w=b.state,g=b.storeItem,_=new X,S=function(t){var e=s[t],r="".concat(p,"/").concat(t);_.addCase(r,e),h[t]=function(t){return v()(a(a({},t&&"object"==typeof t?t:{}),{type:r,payload:t}))}},O=0,x=Object.getOwnPropertyNames(s);O<x.length;O++){S(x[O])}if(l)if("function"==typeof l)l(_);else if("object"==typeof l)for(var E=0,P=Object.getOwnPropertyNames(l);E<P.length;E++){var C=P[E];_.addCase(C,l[C])}if(f&&"object"==typeof f)for(var j=function(e){var r=f[e],n="".concat(p,"/fetching-").concat(e),o="".concat(p,"/fetched-").concat(e);y[e]=J({fetcher:r,after:function(t){var e=t[0];t[1];var r=t[2];v()({type:o,data:e,error:r})},before:function(){v()({type:n})}}),_.addCase(n,(function(t){t[e]=Y(t[e],!0)})),_.addCase(o,(function(r,n){var o,u=n.data,i=n.error;if(i){var c=null===(o=r[e])||void 0===o?void 0:o.valueOf();try{var a=c?Y(t.current(r[e]),!1):c;r[e]=$(a,"error",i)}catch(i){r[e]=$(c,"error",i)}}else r[e]=u}))},R=0,k=Object.getOwnPropertyNames(f);R<k.length;R++){j(k[R])}i=function(t,e){void 0===e&&(e={});var r=e.builder,n=e.callback,u=e.enhanceState,i=e.onChange;return m(u)&&(t=u(t)),r||(r=new X),m(n)&&n(r),function(e,n){var u;null==e&&(e=t);var c=r.equal[n.type],a=e,s=!1;if(c)a=o.default(a,(function(t){var e=c(t,n);if(e)return e})),s=!0;else if(null===(u=r.match)||void 0===u?void 0:u.length){var f=r.match.filter((function(t){return t.matcher(n)}));f.length&&(a=o.default(a,(function(t){for(var e=null,r=0,o=f;r<o.length;r++)e=o[r].reducer(e||t,n);if(e)return e})),s=!0)}else m(r.default)&&(a=o.default(a,(function(t){var e=r.default(t,n);if(e)return e})),s=!0);return m(i)&&s&&i(a),a}}(w,{builder:_,onChange:function(t){w=t,g&&g.set(t)}});var I=function(){return d(r().getState())};return{fetch:y,actions:h,reducer:i,useModel:function(t,e){return wt((function(e){return t?t(d(e)):d(e)}),e)},getState:I,isPending:function(t){return F((I()||{})[t])}}},exports.createPaginationHandler=function(t){var e=this,r=t.fetcher,n=t.after,o=t.before,u=t.isReset,i=t.identifier,c={},a={};return function(){for(var t=[],l=0;l<arguments.length;l++)t[l]=arguments[l];return s(e,void 0,void 0,(function(){var e,s,l,p,d,v,h;return f(this,(function(f){switch(f.label){case 0:if(e=i?i.apply(void 0,t):"def",s=u.apply(void 0,t),l=null,!s&&c[e]!==V.UNACTIVE&&c[e])throw new Error("invalid request ~");return c[e]=V.LOADING,a[e]=(a[e]||0)+1,l=r.apply(void 0,t),p=a[e],o&&o.apply(void 0,t),S(l)?[4,B(l)]:[3,2];case 1:if(d=f.sent(),v=d[0],h=d[1],p===a[e]){if(c[e]=V.UNACTIVE,n&&n([v,t,h]),h)throw h;return[2,v]}throw new Error("invalid response ~");case 2:throw new Error("typeError: fetcher need to return a promise ~")}}))}))}},exports.ctrlEnhance=function(t){void 0===t&&(t={});var e=t.useCtx,r=void 0===e||e,n=t.bindThis,o=void 0!==n&&n;return function(t){if(r){var e=ut(null);Object.defineProperties(t,{Provider:{value:function(t){var r=t.controller,n=t.children;return u.default.createElement(e.Provider,{value:r},n)}},Context:{value:e}})}if(o){var n=Object.getOwnPropertyNames(t.prototype).filter((function(e){return"function"==typeof t.prototype[e]&&!/^use/.test(e)&&"constructor"!==e}));Object.defineProperty(t.prototype,st,{value:function(e){for(var r=0;r<n.length;r++){var o=n[r];e[o]=t.prototype[o].bind(e)}}})}return t}},exports.getStore=H,exports.historyHelper=D,exports.historyMiddleware=function(t){var e=t.dispatch;return U(),window.addEventListener("pageAction",(function(t){var r=window.location,n=r.search,o=r.pathname,u=r.hash,i=window.history.state;e({type:"ROUTE-CHANGED",payload:{hash:u,state:i,search:n,pathname:o,method:t["_".concat("pageAction")]}})})),function(t){return t}},exports.initStore=function(t){var r=t.isDev,n=void 0!==r&&r,o=t.initState,u=void 0===o?{}:o,i=t.middleware,c=void 0===i?[]:i,a=t.reducerRecord,s=void 0===a?{}:a,f=t.rootReducers,l=void 0===f?{}:f,p=e.createStore(G(l,s),u,function(t,r){return void 0===r&&(r=!1),(r&&window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__:e.compose)(e.applyMiddleware.apply(void 0,t))}(c,n));return q||(q=p),{updateReducer:function(t,e){void 0===e&&(e=!1);var r=!1;for(var n in t)!Object.prototype.hasOwnProperty.call(t,n)||s[n]&&!e||(s[n]=t[n],r=!0);r&&p.replaceReducer(G(l,s))},store:p}},exports.isEmpty=function(t){return!t||!(null==t?void 0:t.valueOf())||(g(t)?0===t.length:!!_(t)&&0===Object.getOwnPropertyNames(t).length)},exports.isPending=F,exports.outPromise=K,exports.setPending=Y,exports.setStore=M,exports.thunkMiddleware=function(t){var e=t.getState;return function(t){return function(r){return m(r)?r(t,e):t(r)}}},exports.useController=function(t,e){var r=dt((function(){return new t(e)}),[]);r[at](e);var n=r.useHooks();return[r,n]},exports.useCtrlContext=function(t){return ht(t.Context)},exports.useDispatch=function(){return ht(et).store.dispatch},exports.usePageEffect=function(t){var e=pt(!1),r=gt(t);e.current||(e.current=!0,m(r.current.onEnter)&&r.current.onEnter(R())),vt((function(){m(r.current.onEnterEffect)&&r.current.onEnterEffect(R());var t=r.current.onLeave;return function(){m(t)&&Promise.resolve().then((function(){try{t(R())}catch(t){console.warn(t)}}))}}),[])},exports.usePageState=function(t,e){void 0===e&&(e="");var r=dt((function(){return"".concat(k()).concat(e)}),[]),n=mt((function(){return I(t,r)})),o=n[0],u=n[1],i=n[2],c=bt((function(){return N(i.current,r)}),[]);return vt((function(){return window.addEventListener("beforeunload",c),function(){c(),window.removeEventListener("beforeunload",c)}}),[]),[o,u]},exports.usePropRef=gt,exports.useReduxController=function(t,e){var r=ht(et).store,n=dt((function(){return new t(r,e)}),[]);n[at](e);var o=n.useHooks();return[n,o]},exports.useSelector=wt,exports.useStateRef=mt,exports.withPageHook=function(t,e){var r=e.onEnter,n=e.onLeave;return function(e){var o=St(!1),i=o[0],c=o[1];return Ot((function(){return Promise.resolve().then((function(){return c(!0)})),m(r)&&r(R()),function(){Promise.resolve().then((function(){m(n)&&n(R())}))}}),[]),i?u.default.createElement(t,a({},e)):null}};
//# sourceMappingURL=index.js.map