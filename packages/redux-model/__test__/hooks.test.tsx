import { renderHook, act } from "@testing-library/react-hooks/lib/dom";
import React, { Suspense } from "react";
import { ReduxProvider } from "../src/context";
import { useStore, useDispatch, useSelector } from "../src/hooks";
import { initStore } from "../src/store";

let redux: ReturnType<typeof initStore> = null as any;
beforeAll(() => {
  redux = initStore<any>({});
});

test('useStore', () => {
  const wrapper = ({ children }) => (<ReduxProvider store={redux.store}>{children}</ReduxProvider>);
  const { result } = renderHook(() => useStore(), { wrapper });
  expect(result.current).toBe(redux.store);
})
test('useDispatch', () => {
  const wrapper = ({ children }) => (<ReduxProvider store={redux.store}>{children}</ReduxProvider>);
  const { result } = renderHook(() => useDispatch(), { wrapper });
  expect(result.current).toBe(redux.store.dispatch);
})
test('useSelector - sync === false', async () => {
  const redux = initStore<any>({});
  redux.updateReducer({
    test: (state = 0, action) => {
      switch(action.type) {
        case 'add': return state + 1;
        case 'minus': return state - 1;
        default: return state;
      }
    }
  }, true)
  const wrapper = ({ children }) => (<ReduxProvider store={redux.store}>{children}</ReduxProvider>);
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state => state.test), { wrapper });
  expect(result.current).toBe(0);
  act(() => {
    redux.store.dispatch({type: 'add'});
  })
  expect(result.current).toBe(0); // 延迟更新
  await waitForNextUpdate();
  expect(result.current).toBe(1);
  act(() => {
    redux.store.dispatch({type: 'minus'});
  })
  expect(result.current).toBe(1); // 延迟更新
  await waitForNextUpdate();
  expect(result.current).toBe(0);
});

test('useSelector - sync === true', async () => {
  const redux = initStore<any>({});
  redux.updateReducer({
    test: (state = 0, action) => {
      switch(action.type) {
        case 'add': return state + 1;
        case 'minus': return state - 1;
        default: return state;
      }
    }
  }, true);
  const wrapper = ({ children }) => (<ReduxProvider store={redux.store}>{children}</ReduxProvider>);
  const { result } = renderHook(() => useSelector(state => state.test, { sync: true }), { wrapper });
  // 非延迟更新
  expect(result.current).toBe(0);
  act(() => {
    redux.store.dispatch({type: 'add'});
  })
  expect(result.current).toBe(1);
  act(() => {
    redux.store.dispatch({type: 'minus'});
  })
  expect(result.current).toBe(0);
})

test('useSelector - withSuspense', async () => {
  const redux = initStore<any>({});
  redux.updateReducer({
    bussiness: (state = {}, action) => {
      switch(action.type) {
        case 'set': return { data: action.data };
        case 'fetch': return { fetching: true };
        default: return state;
      }
    }
  }, true);
  const wrapper = ({ children }) => (
    <ReduxProvider store={redux.store}>
      <Suspense fallback={'loading'}>{children}</Suspense>
    </ReduxProvider>
  );
  const { result, waitForNextUpdate } = renderHook(() => useSelector(
    state => state.bussiness, 
    {
      withSuspense: (state) => !!state?.fetching,
    }
  ), { wrapper });
  expect(result.current).toEqual({});
  act(() => {
    redux.store.dispatch({type: 'fetch'});
  })
  const start = Date.now();
  act(() => {
    setTimeout(() => {
      redux.store.dispatch({type: 'set', data: [ 1,2,3 ]});
    }, 100);
  })
  await waitForNextUpdate();
  expect(Date.now() - start >= 100).toBe(true); 
  expect(result.current).toEqual({ data: [ 1,2,3 ] });
});