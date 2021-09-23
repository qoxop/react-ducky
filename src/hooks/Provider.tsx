import React, { createContext, useEffect, useMemo } from "react";
import { Store } from "redux";
import { StateSubscriber } from "../utils/StateSubscriber";

export const ReduxContext = createContext<{store?: Store, subscriber?: StateSubscriber }>({});
export type ReduxContextType = typeof ReduxContext;

export function createProvider(context: ReduxContextType) {
    const Context = context === ReduxContext ? ReduxContext : context;
    return function ReduxProvider({ store, children }: { store: Store, children: any }) {
        const contextValue = useMemo(() => ({
            store,
            subscriber: new StateSubscriber(store)
        }), [store]);
        useEffect(() => contextValue.subscriber.destroy, [contextValue]);
        return <Context.Provider value={contextValue}>{children}</Context.Provider>
    }
}