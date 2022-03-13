import { useMemo, useState } from "react";

import { PromiseFn } from '../typings';
import { createFetchHandler } from "../utils/async";

export const useFetcher = <Args extends any[], Resp = any>(fetcher: PromiseFn<Resp, Args>, deps: any[] = []) => {
  const [state, setState] = useState<{ data?: Resp, error?: Error, loading?: boolean }>({});
  const fetch = useMemo(() => createFetchHandler({
    fetcher,
    before() {
      setState((prev) => ({ ...prev, loading: true }));
    }, 
    after([data, _, error]) {
      setState({ data, error, loading: false })
    }
  }), deps);
  return [fetch, state ] as const;
}