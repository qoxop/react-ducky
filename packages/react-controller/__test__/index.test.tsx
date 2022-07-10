import {  useLayoutEffect, useMemo } from "react";
import { renderHook } from "@testing-library/react-hooks/lib/dom";
import { useController, Controller, ctrlEnhance } from '../index';

type State = {
  lenght: number;
  list: number[];
}
type Props = {
  rate: number;
  initLenght: number;
  getList: (n: number) => Promise<number[]>;
}

@ctrlEnhance({ useCtx: true, bindThis: true })
class TestController extends Controller<State, Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      lenght: props.initLenght,
      list: [],
    }
  }
  public useHooks() {
    const { rate } = this.props;
    const { lenght, list } = this.state;
    const newCount = useMemo(() => lenght * rate, [rate, lenght]);
    useLayoutEffect(() => {
      this.updateList(newCount);
    }, []);
    return {
      count: newCount,
      sum: list.reduce((prev, curr) => prev + curr, 0)
    }
  }
  public async setLenght(lenght: number) {
    const { rate } = this.props;
    this.setState({ lenght });
    await this.updateList(lenght * rate);
  }
  public async updateList(lenght: number) {
    const list = await this.props.getList(lenght);
    this.setState({ list });
  }
}

describe('controller', () => {
  const getList = (n: number) => new Promise((rs) => {
    setTimeout(() => {
      const data = []
      while(n > 0) {
        data.push(n--);
      }
      rs(data);
    }, 10);
  })
  test('', () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useController(TestController, { rate: 2, initLenght: 10, getList }), 
    );
    let [ctrl, data] = result.current;
    expect(data.count).toBe(20)
    expect(data.sum).toBe(0);
  })
})

