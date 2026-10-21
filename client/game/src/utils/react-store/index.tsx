/* eslint-disable react-hooks/rules-of-hooks */
import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useDebugValue,
  PropsWithChildren,
  ReactElement,
  type JSX,
} from 'react';

/**
 * Example:
function CounterStore () {
    const [value, setValue] = useState(1);

    function increase () {
        setValue(value + 1);
    }

    return {
        value,
        increase,
    };
}

function App () {
    return <Provider store={CounterStore}>
        <SubPage />
    </Provider>
}

function SubPage () {
    const counter = useStore(CounterStore);
    return <div>
        count: {counter.value}
        <button onClick={counter.increase}>increase</button>
    </div>;
}

// use consumer in class to visit stores
class SubClassPage extends React.Component {
    public render () {
        return <Consumer store={CounterStore}>
            {(counter) => <div>{counter.value}</div>}
        </Consumer>;
    }
}

// or use HOC to wrap class and visit stores from props
const SubClassPage2 = withStore({counter: CounterStore}, class extends React.Component {
    public render () {
        const counter = this.props.counter;
        return <div>{counter.value}</div>;
    }
})
 */

interface Store<P extends any[] = any[], V = any> {
  (...args: P): V;
  context?: React.Context<Container<V>>;
}
type StoreP<S extends Store> = S extends Store<infer P, any> ? P : never;
type StoreV<S extends Store> = S extends Store<any, infer V> ? V : never;

interface ProviderProps<S extends Store> {
  store: S;
  args?: StoreP<S>;
  memo?: boolean; // like React.memo, without memo it will always re-render
  storeRef?: React.MutableRefObject<StoreV<S>>;
}

type Subscriber = () => void;
class Container<V> {
  private subscribers = new Set<Subscriber>();
  constructor(public state?: V) {}

  public notify() {
    this.subscribers.forEach((sub) => sub());
  }

  public sub(sub: Subscriber) {
    this.subscribers.add(sub);
  }

  public unsub(sub: Subscriber) {
    this.subscribers.delete(sub);
  }
}

const Processor = React.memo(
  (props: {
    onChange: (v: StoreV<Store>) => void;
    store: Store;
    args?: StoreP<Store>;
    memo?: boolean;
  }) => {
    const args = props.args || [];
    const result = props.store(...args);
    useEffect(() => {
      props.onChange(result);
    });
    return null;
  },
  (prevProps, nextProps) => {
    if (!nextProps.memo) {
      return false;
    }
    if (prevProps.args === nextProps.args) {
      return true;
    }
    return isEquals(prevProps.args || [], nextProps.args || []);
  },
);

function Provider<S extends Store, V extends StoreV<S>>(
  props: PropsWithChildren<ProviderProps<S>>,
) {
  const containerRef = useRef<Container<V>>(undefined);
  if (!containerRef.current) {
    containerRef.current = new Container();
  }
  const container = containerRef.current;

  const Context = getStoreContext(props.store, container);
  const [isReady, setReady] = useState(false);

  const onChange = (value: V) => {
    if (!isReady) {
      setReady(true);
    }
    container.state = value;
    if (props.storeRef) {
      props.storeRef.current = value;
    }
    container.notify();
  };

  return (
    <Context.Provider value={container}>
      <Processor
        onChange={onChange}
        store={props.store}
        args={props.args}
        memo={props.memo}
      />
      {isReady && props.children}
    </Context.Provider>
  );
}

function getStoreContext<S extends Store, V extends StoreV<S>>(
  store: Store,
  container?: Container<V>,
) {
  if (store.context) {
    return store.context;
  }
  const context = React.createContext<Container<V>>(
    container || new Container(),
  );
  store.context = context;
  return context;
}

type Deps<T> = (v: T) => unknown[];
function useStore<S extends Store, V extends StoreV<S>>(
  store: S,
  deps?: Deps<V>,
) {
  useDebugValue(store.name);
  const container = useContext(getStoreContext(store)) as Container<V>;
  const [state, setState] = useState(container.state);
  const depsRef = useRef<unknown[]>([]);

  useEffect(() => {
    const subscriber = () => {
      if (!deps) {
        setState(container.state);
      } else {
        const oldDeps = depsRef.current;
        const newDeps = deps(container.state as V);
        if (newDeps.length && !isEquals(oldDeps, newDeps)) {
          setState(container.state);
        }
        depsRef.current = newDeps;
      }
    };
    container.sub(subscriber);
    return () => {
      container.unsub(subscriber);
    };
  }, []);

  if (!state) {
    throw new Error(`The store ${store.name} is not initialized.`);
  }

  return state;
}

function isEquals(v1: unknown[], v2: unknown[]) {
  if (v1.length !== v2.length) {
    return false;
  }
  return v1.every((v, i) => v === v2[i]);
}

function ComposedProvider(props: {
  stores: ProviderProps<Store<any[]>>[];
  children: React.ReactNode;
}) {
  return props.stores.reverse().reduce((children, providerProps) => {
    return <Provider {...providerProps}>{children}</Provider>;
  }, props.children) as JSX.Element;
}

// for old classes use store
function withStore(
  stores: { [name: string]: Store },
  Component: React.ComponentType<any>,
) {
  return function (props) {
    const storeList = {};
    for (let i = 0, keys = Object.keys(stores); i < keys.length; i++) {
      const name = keys[i];
      // tslint:disable-next-line: react-hooks-nesting
      const store = useStore(stores[name]);
      storeList[name] = store;
    }
    const _props = {
      ...storeList,
      ...props,
    };
    return <Component {..._props} />;
  };
}

function Consumer<S extends Store>(props: {
  store: S;
  deps?: Deps<StoreV<S>>;
  children: (store: StoreV<S>) => React.ReactNode;
}) {
  const store = useStore(props.store);
  return props.children(store) as ReactElement<any>;
}

export { Provider, ComposedProvider, useStore, Consumer, withStore };
