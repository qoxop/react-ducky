let store = null;
export const getStore = () => store;
export const duckyMiddleware = (_store: any) => {
    store = _store
    return (next: any) => next;
}