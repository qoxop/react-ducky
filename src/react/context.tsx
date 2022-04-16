import React from "react";
import { Store } from "redux";
import { ReduxSubscriber } from "../helper/state-subscriber";
import { getCurrentPageAction, PageAction } from "../utils/history";

const {
    useMemo,
    createContext,
    useEffect,
    useLayoutEffect,
    useCallback,
    useState,
} = React;

const ReduxContext = createContext<{store?: Store, subscriber?: ReduxSubscriber }>({});

const ReduxProvider:React.FC<{ store: Store }> = ({ store, children }) => {
    const contextValue = useMemo(() => ({
        store,
        subscriber: new ReduxSubscriber(store)
    }), [store]);
    useEffect(() => contextValue.subscriber.destroy, [contextValue]);
    return (
        <ReduxContext.Provider value={contextValue}>
            {children}
        </ReduxContext.Provider>
    )
}
const PageActionContext = createContext<PageAction>('replace');

const PageActionProvider:React.FC = (props) => {
    const [routeAction, setPageAction] = useState(getCurrentPageAction);
    const updatePageAction = useCallback((e) => setPageAction(e['_routeAction']), [setPageAction]);
    useLayoutEffect(() => {
        window.addEventListener('routeAction', updatePageAction);
        return () => window.removeEventListener('routeAction', updatePageAction)
    }, [updatePageAction]);
    return (
        <PageActionContext.Provider value={routeAction}>
            {props.children}
        </PageActionContext.Provider>
    )
}

export {
    ReduxContext,
    ReduxProvider,
    PageActionContext,
    PageActionProvider,
}