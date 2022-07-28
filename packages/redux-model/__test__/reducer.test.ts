import { PayloadAction } from '../typings';
import { createReducerWithOpt, createReducer } from '../src/create-reducer';

describe('reducer', () => {
  test('createReducer', () => {
    const addMatcherCall = jest.fn();
    const resetMatcherCall = jest.fn();
    const originConsoleWarn = console.warn;
    const mockWarn = console.warn = jest.fn();
    const reducer = createReducer({count: 1}, (builder) => {
      builder
      .addCase('add', (state, action: PayloadAction<number>) => {
        state.count += action.payload;
      })
      .addCase('minus', (state, action: PayloadAction<number>) => {
        state.count -= action.payload;
      })
      .addCase('add', () => {
        // never throw
        throw new Error("some case");
      })
      .addCase('reset', (state, action: PayloadAction<number>) => {
        state.count = action.payload;
      })
      .addMatcher(
        (action) => /add/.test(action.type),
        (state, action) => {
          addMatcherCall();
          const num = +action.type.split('-')[1];
          if (num) {
            state.count += num
          }
        }
      )
      .addMatcher(
        (action) => /reset/.test(action.type),
        (state, action) => {
          const num = +action.type.split('-')[1];
          resetMatcherCall()
          if (num) {
            return {
              ...state,
              count: num,
            }
          }
        }
      )
    });
    let data: {count: number};
    data = reducer({count: 1}, { type: 'add', payload: 1 });
    expect(data.count).toBe(2);
    data = reducer({count: 1}, { type: 'minus', payload: 1 });
    expect(data.count).toBe(0);
    data = reducer({count: 1}, { type: 'add-10'});
    expect(data.count).toBe(11);
    data = reducer({count: 1}, { type: 'reset-10'});
    expect(data.count).toBe(10);
    expect(addMatcherCall.mock.calls.length).toBe(1)
    expect(resetMatcherCall.mock.calls.length).toBe(1);
    expect(mockWarn.mock.calls.length).toBe(1);
    console.warn = originConsoleWarn;
  });

  test('createReducerWithOpt', () => {
    const onChangeCall = jest.fn();
    const reducer = createReducerWithOpt({count: 0}, {
      callback: (builder => {
        builder
        .addCase('add', (state, action: PayloadAction<number>) => {
          state.count += action.payload;
        })
        .addCase('minus', (state, action: PayloadAction<number>) => {
          state.count -= action.payload;
        })
      }),
      onChange: (data)=> {
        onChangeCall();
      }
    });
    let data: {count: number};
    data = reducer({count: 1}, { type: 'add', payload: 1 });
    expect(data.count).toBe(2);
    data = reducer({count: 1}, { type: 'minus', payload: 1 });
    expect(data.count).toBe(0);

    data = reducer({count: 1}, { type: 'no-handle', payload: 1 });
    expect(data.count).toBe(1);
    expect(onChangeCall.mock.calls.length).toBe(2)
  })
})