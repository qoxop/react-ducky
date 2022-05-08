import t,{produce as e,current as n}from"immer";import{createStore as r,applyMiddleware as o,compose as u,combineReducers as i}from"redux";import c from"react";var a=function(t,e){return a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])},a(t,e)};function s(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}a(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}var f=function(){return f=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},f.apply(this,arguments)};function l(t,e,n,r){return new(n||(n=Promise))((function(o,u){function i(t){try{a(r.next(t))}catch(t){u(t)}}function c(t){try{a(r.throw(t))}catch(t){u(t)}}function a(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(i,c)}a((r=r.apply(t,e||[])).next())}))}function v(t,e){var n,r,o,u,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return u={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(u[Symbol.iterator]=function(){return this}),u;function c(u){return function(c){return function(u){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,r&&(o=2&u[0]?r.return:u[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,u[1])).done)return o;switch(r=0,o&&(u=[2&u[0],o.value]),u[0]){case 0:case 1:o=u;break;case 4:return i.label++,{value:u[1],done:!1};case 5:i.label++,r=u[1],u=[0];continue;case 7:u=i.ops.pop(),i.trys.pop();continue;default:if(!(o=i.trys,(o=o.length>0&&o[o.length-1])||6!==u[0]&&2!==u[0])){i=0;continue}if(3===u[0]&&(!o||u[1]>o[0]&&u[1]<o[3])){i.label=u[1];break}if(6===u[0]&&i.label<o[1]){i.label=o[1],o=u;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(u);break}o[2]&&i.ops.pop(),i.trys.pop();continue}u=e.call(t,i)}catch(t){u=[6,t],r=0}finally{n=o=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,c])}}}var p,h=window.dispatchEvent.bind(window),d=window.addEventListener.bind(window),y=JSON.parse,b=JSON.stringify,w=window.history,g=window.localStorage,m=window.sessionStorage,_=function(t){return Array.isArray?Array.isArray(t):"[object Array]"===function(t){return Object.prototype.toString.call(t)}(t)},S=function(t){return"function"==typeof t},O=function(t){return null!==t&&"object"==typeof t},E=function(t){return O(t)&&S(t.then)&&S(t.catch)},j=function(t,e){if(t===e)return!0;if(e&&t&&"object"==typeof e&&"object"==typeof t){var n=Object.keys(e);return n.every((function(n){return e[n]===t[n]}))&&n.length===Object.keys(t).length}return!1},P=(p=0,function(){return"u_".concat(p++).concat(Date.now().toString(36))}),C=function(t){return{get:function(){try{var e=m.getItem(t);return e?y(e).v:null}catch(t){return null}},set:function(e){m.setItem(t,b({v:e}))}}},k=!1,I="replace",N=P(),R=function(){return I},x=function(){var t;return(null===(t=w.state)||void 0===t?void 0:t._key_)||N},T=function(t,e){var n=e||x(),r=m.getItem(n);if(r)try{return y(r).v}catch(t){console.warn(t)}return S(t)?t():t},A=function(t,e){var n=e||x();t.idx&&t.key?t.usr&&m.setItem(n,b({v:t.usr})):m.setItem(n,b({v:t}))},U=function(t){return t&&t.idx&&t.key?t.key:P()},D=function(t,e){var n;return!e||-1===(null==t?void 0:t._key_)||-1===(null===(n=null==t?void 0:t.usr)||void 0===n?void 0:n._key_)},L=function(){if(!k){var t=C("$route_stack"),e=t.get()||[x()],n={pushState:function(n){var r=x(),o=e.findIndex((function(t){return t===r}));if(o>-1){var u=e.splice(o+1,e.length-o-1,n);setTimeout((function(){for(var t=Object.keys(m),e=0,n=u;e<n.length;e++){for(var r=n[e],o=[],i=0,c=t;i<c.length;i++){var a=c[i];0===a.indexOf(r)?m.removeItem(a):o.push(a)}t=o}}),1e3/60)}else e.push(n);t.set(e)},replaceState:function(n){var r=x(),o=e.findIndex((function(t){return t===r}));e[o]=n,t.set(e)}},r=x(),o=function(t){var n=x();switch(t){case"pushState":I="push";break;case"replaceState":I="replace";break;default:var o=e.findIndex((function(t){return t===r})),u=e.findIndex((function(t){return t===n}));I=o>u?"goBack":"forward"}var i=new Event("pageAction");i["_".concat("pageAction")]=I,h(i),r=n};w.pushState=u("pushState"),w.replaceState=u("replaceState"),d("popstate",(function(){return o("popstate")})),k=!0}function u(t){var e=w[t];return function(r,u,i){var c=function(t,e){return f(f({},t),{_key_:D(t,e)?x():U(t)})}(r,i);r&&A(r,c._key_),null!=i?(n[t](c._key_),e.call(this,c,u||"",i)):e.call(this,c,u||"",i),o(t)}}},$=Object.freeze({__proto__:null,EventName:"pageAction",getPageId:x,getPageState:T,setPageState:A,enhanceHistory:L,getCurrentPageAction:R});function q(t,e,n){this.valueOf=function(){return t},"string"==typeof t&&(this.toString=function(){return t}),this[e]=n}var H=function(t,e,n){var r;return t&&"object"==typeof t?Object.assign(_(t)?[]:{},t,((r={})[e]=n,r)):new q(t,e,n)},G=function(t){return!t||!(null==t?void 0:t.valueOf())||(_(t)?0===t.length:!!O(t)&&0===Object.getOwnPropertyNames(t).length)};function V(t){var e=t.getState;return function(t){return function(n){return S(n)?n(t,e):t(n)}}}function M(t){var e=t.dispatch;return L(),window.addEventListener("pageAction",(function(t){var n=window.location,r=n.search,o=n.pathname,u=n.hash,i=window.history.state;e({type:"ROUTE-CHANGED",payload:{hash:u,state:i,search:r,pathname:o,method:t["_".concat("pageAction")]}})})),function(t){return t}}var X=null,K=function(){return function(){if(!X)throw new Error("Store 未初始化");return!0}()&&X},J=function(t){return X=t},z=function(t,e){var n=e&&Object.keys(e).length?i(e):function(t){return t};return function(e,r){if("ROUTE-CHANGED"===r.type)return f(f({},e),{_CURRENT_ROUTE:r.payload});var o=e._CURRENT_ROUTE,u=function(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(t);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(t,r[o])&&(n[r[o]]=t[r[o]])}return n}(e,["_CURRENT_ROUTE"]);return f(f({},t[r.type]?t[r.type](u,r):n(u,r)),{_CURRENT_ROUTE:o})}};function B(t){var e=t.isDev,n=void 0!==e&&e,i=t.initState,c=void 0===i?{}:i,a=t.middleware,s=void 0===a?[]:a,f=t.reducerRecord,l=void 0===f?{}:f,v=t.rootReducers,p=void 0===v?{}:v,h=r(z(p,l),c,function(t,e){return void 0===e&&(e=!1),(e&&window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__:u)(o.apply(void 0,t))}(s,n));return X||(X=h),{updateReducer:function(t,e){void 0===e&&(e=!1);var n=!1;for(var r in t)!Object.prototype.hasOwnProperty.call(t,r)||l[r]&&!e||(l[r]=t[r],n=!0);n&&h.replaceReducer(z(p,l))},store:h}}var Y,F=function(){function t(){this.equal={},this.match=[]}return t.prototype.addCase=function(t,e){return this.equal[t]?console.warn("action type duplicate ~"):this.equal[t]=e,this},t.prototype.addMatcher=function(t,e){return this.match.push({reducer:e,matcher:t}),this},t.prototype.addDefaultCase=function(t){return this.default=t,this},t}();function Q(){var t={resolve:null,reject:null,promise:null};return t.promise=new Promise((function(e,n){t.resolve=e,t.reject=n})),t}function W(t){return l(this,void 0,void 0,(function(){return v(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,t];case 1:return[2,[e.sent(),null]];case 2:return[2,[null,e.sent()]];case 3:return[2]}}))}))}function Z(t){var e=this,n=t.fetcher,r=t.after,o=t.before,u=t.identifier,i={};return function(){for(var t=[],c=0;c<arguments.length;c++)t[c]=arguments[c];return l(e,void 0,void 0,(function(){var e,c,a,s,f,l;return v(this,(function(v){switch(v.label){case 0:return e=u?u.apply(void 0,t):"def",c=n.apply(void 0,t),o&&o.apply(void 0,t),i[e]=(i[e]||0)+1,a=i[e],[4,W(c)];case 1:if(s=v.sent(),f=s[0],l=s[1],a===i[e]){if(r&&r([f,t,l]),l)throw l;return[2,f]}throw new Error("invalid response ~")}}))}))}}function tt(t){var e=this,n=t.fetcher,r=t.after,o=t.before,u=t.isReset,i=t.identifier,c={},a={};return function(){for(var t=[],s=0;s<arguments.length;s++)t[s]=arguments[s];return l(e,void 0,void 0,(function(){var e,s,f,l,p,h,d;return v(this,(function(v){switch(v.label){case 0:if(e=i?i.apply(void 0,t):"def",s=u.apply(void 0,t),f=null,!s&&c[e]!==Y.UNACTIVE&&c[e])throw new Error("invalid request ~");return c[e]=Y.LOADING,a[e]=(a[e]||0)+1,f=n.apply(void 0,t),l=a[e],o&&o.apply(void 0,t),E(f)?[4,W(f)]:[3,2];case 1:if(p=v.sent(),h=p[0],d=p[1],l===a[e]){if(c[e]=Y.UNACTIVE,r&&r([h,t,d]),d)throw d;return[2,h]}throw new Error("invalid response ~");case 2:throw new Error("typeError: fetcher need to return a promise ~")}}))}))}}!function(t){t[t.LOADING=1]="LOADING",t[t.UNACTIVE=2]="UNACTIVE"}(Y||(Y={}));var et=Symbol("PENDING_KEY"),nt=function(t){return!(!t||!0!==t[et])},rt=function(t,e){return e?H(t,et,!0):function(t,e){var n;return t&&e in t&&delete t[e],null!==(n=null==t?void 0:t.valueOf())&&void 0!==n?n:t}(t,et)},ot=function(t){function e(e){var n=t.call(this)||this;return n.getState=function(t){return t?t(n.store.getState()):n.store.getState()},n.store=e,n.startListen(),n}return s(e,t),e.prototype.startListen=function(){var t,e=this;this.unsubscribe||(this.unsubscribe=this.store.subscribe((function(){e.emit(e.store.getState(),!0);var n=t=function(){return e.emit(e.store.getState(),!1)};Promise.resolve().then((function(){t===n&&t()}))})))},e.prototype.destroy=function(){this.clear(),this.unsubscribe&&this.unsubscribe(),this.unsubscribe=null},e}(function(){function t(){this.listeners=new Map}return t.prototype.emit=function(t,e){this.listeners.forEach((function(n,r,o){if(!!n.sync===e){var u=n.callback(t);n.once&&u&&o.delete(r)}}))},t.prototype.add=function(t,e,n){this.listeners.set(t,f({callback:e},n))},t.prototype.remove=function(t){this.listeners.delete(t)},t.prototype.has=function(t){return this.listeners.has(t)},t.prototype.clear=function(){this.listeners.clear()},t}()),ut=c.useRef,it=c.createContext,ct=c.useLayoutEffect,at=it({}),st=function(t){var e=t.store,n=t.children,r=t.setDefault,o=void 0!==r&&r,u=ut({store:e,subscriber:null});return u.current.subscriber||(o&&J(e),u.current.subscriber=new ot(e)),ct((function(){return u.current.subscriber.startListen(),u.current.subscriber.destroy.bind(u.current.subscriber)}),[u]),c.createElement(at.Provider,{value:u.current},n)},ft=function(t){var e=t.store,n=t.children;return c.createElement(st,{store:e,setDefault:!0},n)},lt=c.useState,vt=c.useReducer,pt=c.createContext,ht=Symbol?Symbol("$setState"):"$__controller_$_set_state",dt=Symbol?Symbol("$forceUpdate"):"$__controller_$_force_update",yt=Symbol?Symbol("$classHooks"):"$__controller_$_class_hooks",bt=Symbol?Symbol("$bindThis"):"$__controller_$_bind_this";function wt(t){void 0===t&&(t={});var e=t.useCtx,n=void 0===e||e,r=t.bindThis,o=void 0!==r&&r;return function(t){if(n){var e=pt(null);Object.defineProperties(t,{Provider:{value:function(t){var n=t.controller,r=t.children;return c.createElement(e.Provider,{value:n},r)}},Context:{value:e}})}if(o){var r=Object.getOwnPropertyNames(t.prototype).filter((function(e){return"function"==typeof t.prototype[e]&&!/^use/.test(e)&&"constructor"!==e}));Object.defineProperty(t.prototype,bt,{value:function(e){for(var n=0;n<r.length;n++){var o=r[n];e[o]=t.prototype[o].bind(e)}}})}return t}}var gt=function(){function t(t){var e=this;this.state={},this.props={},this.setState=function(t){return e[ht](t)},this.forceUpdate=function(){return e[dt]()},t&&(this.props=t),this[bt]&&this[bt](this)}return t.prototype.useHooks=function(){return{}},t.prototype[yt]=function(t){var n=lt(this.state),r=n[0],o=n[1];this[dt]=vt((function(t){return t+1}),0)[1],this.state=r,this.props=t,this[ht]||(this[ht]=function(t){o("function"==typeof t?e(t):function(e){return f(f({},e),t)})})},t.Context=pt(null),t}(),mt=function(t){function e(e,n){var r=t.call(this,n)||this;return r.store=e,r.dispatch=e.dispatch,r}return s(e,t),e}(gt),_t=c.useRef,St=c.useMemo,Ot=c.useEffect,Et=c.useContext,jt=c.useReducer,Pt=c.useCallback,Ct=function(){return Et(at).store.dispatch};function kt(t,e){void 0===e&&(e={});var n=St((function(){return{eq:e.eq||j,sync:e.sync,withSuspense:!0===e.withSuspense?nt:S(e.withSuspense)?e.withSuspense:null}}),[]),r=n.eq,o=n.withSuspense,u=n.sync,i=Et(at),c=i.subscriber,a=i.store,s=jt((function(t){return t+1}),0),f=s[0],l=s[1],v=St((function(){return t(a.getState())}),[a,f]),p=_t(v);if(Ot((function(){var e=Symbol("use-selector"),n=t(a.getState());return r(n,p.current)||(Promise.resolve().then(l),p.current=n),c.add(e,(function(e){var n=t(e);r(n,p.current)||(p.current=n,l())}),{sync:u}),function(){return c.remove(e)}}),[a]),o&&o(v)){var h=Q(),d=h.promise,y=h.resolve,b=Symbol("with-suspense");throw c.add(b,(function(e){var n=t(e);if(!o(n))return y(n),!0}),{once:!0}),d}return v}function It(t,e){var n=St((function(){return new t(e)}),[]);n[yt](e);var r=n.useHooks();return[n,r]}function Nt(t,e){var n=Et(at).store,r=St((function(){return new t(n,e)}),[]);r[yt](e);var o=r.useHooks();return[r,o]}function Rt(t){return Et(t.Context)}function xt(t){var e=_t(t);return e.current!==t&&(e.current=t),e}function Tt(t){var e=jt((function(t){return t+1}),0);e[0];var n=e[1],r=_t(function(t){return S(t)?t():t}(t)),o=Pt((function(t,e){S(t)?r.current=t(r.current):r.current=t,e||n()}),[]);return[r.current,o,r]}function At(t){var e=_t(!1),n=xt(t);e.current||(e.current=!0,S(n.current.onEnter)&&n.current.onEnter(R())),Ot((function(){S(n.current.onEnterEffect)&&n.current.onEnterEffect(R());var t=n.current.onLeave;return function(){S(t)&&Promise.resolve().then((function(){try{t(R())}catch(t){console.warn(t)}}))}}),[])}function Ut(t,e){void 0===e&&(e="");var n=St((function(){return"".concat(x()).concat(e)}),[]),r=Tt((function(){return T(t,n)})),o=r[0],u=r[1],i=r[2],c=Pt((function(){return A(i.current,n)}),[]);return Ot((function(){return window.addEventListener("beforeunload",c),function(){c(),window.removeEventListener("beforeunload",c)}}),[]),[o,u]}var Dt=function(t){if(t.cacheKey){var e=t.cacheKey,n=t.cacheStorage,r=void 0===n?"session":n,o=null;return{storeItem:o="session"===r?C(e):function(t,e,n){var r={get:function(){try{var n=t.getItem(e);return n?y(n).v:null}catch(t){return null}},set:function(r){t.setItem(e,b({v:r,h:n}))}};try{y(t.getItem(e)||"{}").h!==n&&r.set(null)}catch(t){r.set(null)}return r}("local"===r?g:r,e,t.cacheVersion||b(t.initialState)),state:o.get()||t.initialState}}return{storeItem:null,state:t.initialState}};function Lt(e,r){void 0===r&&(r=K);for(var o,u,i,c=e.statePaths,a=e.reducers,s=e.fetch,l=e.extraReducers,v=c.join("_").toUpperCase(),p=(o=c,void 0===u&&(u=null),function(t){for(var e=t,n=0,r=o;n<r.length;n++){var i=r[n];if(!e)return u;e=e[i]}return e}),h=function(){return r().dispatch},d={},y={},b=Dt(e),w=b.state,g=b.storeItem,m=new F,_=function(t){var e=a[t],n="".concat(v,"/").concat(t);m.addCase(n,e),d[t]=function(t){return h()(f(f({},t&&"object"==typeof t?t:{}),{type:n,payload:t}))}},O=0,E=Object.getOwnPropertyNames(a);O<E.length;O++){_(E[O])}if(l)if("function"==typeof l)l(m);else if("object"==typeof l)for(var j=0,P=Object.getOwnPropertyNames(l);j<P.length;j++){var C=P[j];m.addCase(C,l[C])}if(s&&"object"==typeof s)for(var k=function(t){var e=s[t],r="".concat(v,"/fetching-").concat(t),o="".concat(v,"/fetched-").concat(t);y[t]=Z({fetcher:e,after:function(t){var e=t[0];t[1];var n=t[2];h()({type:o,data:e,error:n})},before:function(){h()({type:r})}}),m.addCase(r,(function(e){e[t]=rt(e[t],!0)})),m.addCase(o,(function(e,r){var o,u=r.data,i=r.error;if(i){var c=null===(o=e[t])||void 0===o?void 0:o.valueOf();try{var a=c?rt(n(e[t]),!1):c;e[t]=H(a,"error",i)}catch(i){e[t]=H(c,"error",i)}}else e[t]=u}))},I=0,N=Object.getOwnPropertyNames(s);I<N.length;I++){k(N[I])}i=function(e,n){void 0===n&&(n={});var r=n.builder,o=n.callback,u=n.enhanceState,i=n.onChange;return S(u)&&(e=u(e)),r||(r=new F),S(o)&&o(r),function(n,o){var u;null==n&&(n=e);var c=r.equal[o.type],a=n,s=!1;if(c)a=t(a,(function(t){var e=c(t,o);if(e)return e})),s=!0;else if(null===(u=r.match)||void 0===u?void 0:u.length){var f=r.match.filter((function(t){return t.matcher(o)}));f.length&&(a=t(a,(function(t){for(var e=null,n=0,r=f;n<r.length;n++)e=r[n].reducer(e||t,o);if(e)return e})),s=!0)}else S(r.default)&&(a=t(a,(function(t){var e=r.default(t,o);if(e)return e})),s=!0);return S(i)&&s&&i(a),a}}(w,{builder:m,onChange:function(t){w=t,g&&g.set(t)}});var R=function(){return p(r().getState())};return{fetch:y,actions:d,reducer:i,useModel:function(t,e){return kt((function(e){return t?t(p(e)):p(e)}),e)},getState:R,isPending:function(t){return nt((R()||{})[t])}}}var $t=c.useState,qt=c.useEffect;function Ht(t,e){var n=e.onEnter,r=e.onLeave;return function(e){var o=$t(!1),u=o[0],i=o[1];return qt((function(){return Promise.resolve().then((function(){return i(!0)})),S(n)&&n(R()),function(){Promise.resolve().then((function(){S(r)&&r(R())}))}}),[]),u?c.createElement(t,f({},e)):null}}export{F as Builder,gt as Controller,ft as DuckyProvider,at as ReduxContext,mt as ReduxController,st as ReduxProvider,W as alwayResolve,Z as createFetchHandler,Lt as createModel,tt as createPaginationHandler,wt as ctrlEnhance,K as getStore,$ as historyHelper,M as historyMiddleware,B as initStore,G as isEmpty,nt as isPending,Q as outPromise,rt as setPending,J as setStore,V as thunkMiddleware,It as useController,Rt as useCtrlContext,Ct as useDispatch,At as usePageEffect,Ut as usePageState,xt as usePropRef,Nt as useReduxController,kt as useSelector,Tt as useStateRef,Ht as withPageHook};
//# sourceMappingURL=index.esm.js.map
