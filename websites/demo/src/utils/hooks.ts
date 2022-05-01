import { usePageState } from "react-ducky";
import { useCallback, useEffect, useRef } from "react";

/**
 * 跳过首次渲染的副作用
 * @param effect
 * @param deps
 */
export const useUpdatedEffect = (effect: () => any, deps?: any[]) => {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      return effect();
    } else {
      mounted.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * 记住滚动位置
 * @param resetBy
 * @param key
 * @returns
 */
export const useMemoriesScroll = (
  config: {
    resetBy?: any[];
    onScrollEnd?: () => Promise<any>;
  } = {},
  key: string = "memo-scroll",
):[(event: React.UIEvent<HTMLDivElement>) => void, React.MutableRefObject<HTMLDivElement>] => {
  const {resetBy = [], onScrollEnd} = config;
  const memories = useRef({
    timeout: null as any,
    onScrollEnd: false,
  })
  const boxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = usePageState(0, key);
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop, true);
    clearTimeout(memories.current.timeout);
    memories.current.timeout = setTimeout(() => {
      if (boxRef.current && boxRef.current.lastElementChild) {
        const parentPosition = boxRef.current.getBoundingClientRect();
        const childPosition = boxRef.current.lastElementChild.getBoundingClientRect();
        if ( childPosition.top <= parentPosition.bottom) {
          if (onScrollEnd && !memories.current.onScrollEnd) {
            memories.current.onScrollEnd = true;
            onScrollEnd().finally(() => {
              memories.current.onScrollEnd = false;
            });
          }
        }
      }
    }, 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (boxRef.current && scrollTop) {
      boxRef.current.scrollTop = scrollTop;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useUpdatedEffect(() => {
    if(resetBy.length) {
      setScrollTop(0);
      if (boxRef.current) {
        boxRef.current.scrollTop = 0;
      }
    }
  }, resetBy)
  return [handleScroll, boxRef];
}

export const useMemoriesVisited = (resetBy: any[] = [], key = 'memories-visited'):[Record<string, boolean>, (id: string) => void] => {
  const [visitedMap, setVisited] = usePageState({}, key);
  const onVisit = useCallback((id: string) => {
    setVisited(v => ({ ...v, [id]: true }));
  }, [setVisited]);
  useUpdatedEffect(() => {
    if(resetBy.length) {
      setVisited({});
    }
  }, resetBy);
  return [visitedMap, onVisit];
}