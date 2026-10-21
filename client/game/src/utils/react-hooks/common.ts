import React, {
  DependencyList,
  EffectCallback,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { debounce } from '../debounce-throttle';
import { deepEqual } from '../deepEqual';
import { isMobile } from '../mobile';

export function useInfiniteScroll(
  loadNext: () => void,
  enableLoad: boolean,
  elementRef?: React.RefObject<any>,
) {
  useEffect(() => {
    if (elementRef === null) {
      return void 0;
    }
    const focusElement = elementRef ? elementRef.current : null;
    const handleScroll = debounce(() => {
      let targetScrollTop = document.documentElement.scrollTop;
      if (focusElement) {
        targetScrollTop = focusElement.scrollTop;
      }
      if (
        window.innerHeight + targetScrollTop >=
          document.body.scrollHeight - 600 &&
        enableLoad
      ) {
        loadNext();
      }
    }, 250);

    const handleWhenCannotScroll = debounce((e) => {
      e.preventDefault();
      let clientHeight = 0;
      let scrollHeight = 0;
      if (focusElement) {
        clientHeight = focusElement.clientHeight;
        scrollHeight = focusElement.scrollHeight;
      } else {
        clientHeight = window.innerHeight;
        scrollHeight = document.body.scrollHeight;
      }

      if (enableLoad && scrollHeight === clientHeight) {
        loadNext();
      }
    }, 250);

    const mouseEvent = isMobile() ? 'touchmove' : 'wheel';
    if (focusElement) {
      focusElement.addEventListener('scroll', handleScroll);
      if (enableLoad) {
        focusElement.addEventListener(mouseEvent, handleWhenCannotScroll);
      }
    } else {
      window.addEventListener('scroll', handleScroll);
      if (enableLoad) {
        window.addEventListener(mouseEvent, handleWhenCannotScroll);
      }
    }

    return () => {
      if (focusElement) {
        focusElement.removeEventListener('scroll', handleScroll);
        focusElement.removeEventListener(mouseEvent, handleWhenCannotScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener(mouseEvent, handleWhenCannotScroll);
      }
    };
  }, [enableLoad, loadNext, elementRef]);
}

export function useWindowResizeListener(
  listener: () => void,
  deps: any[] = [],
) {
  useEffect(() => {
    const debounceListener = debounce(listener, 250);
    window.addEventListener('resize', debounceListener);
    return () => window.removeEventListener('resize', debounceListener);
  }, deps);
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useConstructor(callback: () => void | (() => void)) {
  const initializedRef = useRef(false);
  if (initializedRef.current) {
    return;
  }
  callback();
  initializedRef.current = true;
}

type DataList<T> = {
  rows: T[];
  count: number;
};
export function useFetchDataList<T>(
  fetch: (spec: {
    offset: number;
    reload: boolean;
  }) => Promise<DataList<T> | void>,
  onError: (err) => void,
  deps: any[],
  elementRef?: React.RefObject<any>,
) {
  const [list, setList] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchData = (reload: boolean) => {
    setLoading(true);
    const thisFetchId = fetchIdRef.current;
    fetch({ offset, reload })
      .then((res) => {
        if (thisFetchId !== fetchIdRef.current) {
          return;
        }
        setLoading(false);
        setInitialized(true);
        if (!res) {
          return;
        }
        setList(reload ? res.rows : [...list, ...res.rows]);
        setOffset(reload ? res.rows.length : offset + res.rows.length);
        if (res.rows.length === 0) {
          setCount(list.length);
        } else {
          setCount(res.count);
        }
      })
      .catch((err) => {
        onError(err);
        setLoading(false);
        setInitialized(true);
      });
  };
  useEffect(() => {
    setList([]);
    setOffset(0);
    setCount(0);
    fetchIdRef.current++;
    fetchData(true);
    setInitialized(false);
  }, deps);

  useInfiniteScroll(
    () => fetchData(false),
    !isLoading && offset < count,
    elementRef,
  );

  const theEnd = list.length >= count;
  return {
    list,
    offset,
    count,
    isLoading,
    initialized,
    setLoading,
    showEnd: !isLoading && theEnd,
    showLoading: !theEnd && isLoading,
    setList,
  };
}

export function useDidUpdateEffect(func, deps) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      func();
    } else {
      didMount.current = true;
    }
  }, deps);
}

export function useDeleteFromList<
  T extends { [key: string]: any },
  Key extends keyof T,
>(setList: React.Dispatch<React.SetStateAction<T[]>>) {
  return (key: Key, value: T[Key]) => {
    setList((prevList) => {
      return prevList.filter((item) => item && item[key] !== value);
    });
  };
}

const isPrimitive = (val: any) => val !== Object(val);

type DepsEqualFnType<TDeps extends DependencyList> = (
  prevDeps: TDeps,
  nextDeps: TDeps,
) => boolean;

const useCustomCompareEffect = <TDeps extends DependencyList>(
  effect: EffectCallback,
  deps: TDeps,
  depsEqual: DepsEqualFnType<TDeps>,
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useCustomCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      );
    }

    if (deps.every(isPrimitive)) {
      console.warn(
        '`useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }

    if (typeof depsEqual !== 'function') {
      console.warn(
        '`useCustomCompareEffect` should be used with depsEqual callback for comparing deps list',
      );
    }
  }

  const ref = useRef<TDeps | undefined>(undefined);

  if (!ref.current || !depsEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, ref.current);
};

export const useDeepCompareEffect = (
  effect: EffectCallback,
  deps: DependencyList,
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      );
    }

    if (deps.every(isPrimitive)) {
      console.warn(
        '`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }
  }

  useCustomCompareEffect(effect, deps, deepEqual);
};

export function useDebounce(fn, delay, dep = []) {
  const { current } = useRef<{ fn: any; timer: number | null }>({
    fn,
    timer: null,
  });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn],
  );

  return useCallback(function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = window.setTimeout(() => {
      current.fn(...args);
    }, delay);
  }, dep);
}

export const useAsyncFn = <T>(
  fn: (...args) => Promise<T>,
  deps: DependencyList,
  initialData: T,
) => {
  const lastCallId = useRef(0);

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [initialize, setInitialize] = useState<boolean>();

  const cb = useCallback(async (...args) => {
    const callId = ++lastCallId.current;
    setLoading(true);

    return fn(...args).then(
      (value) => {
        if (callId === lastCallId.current) {
          setData(value);
          setLoading(false);
        }
        setInitialize(true);
        return value;
      },
      (err) => {
        if (callId === lastCallId.current) {
          setError(err);
          setLoading(false);
        }
        setInitialize(true);
        return error;
      },
    ) as ReturnType<(...args) => Promise<T>>;
  }, deps);

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    call: cb,
    initialize,
  };
};
