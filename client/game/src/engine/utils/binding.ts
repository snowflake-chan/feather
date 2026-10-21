// pulls out only the props of T which are type U
export type RestrictProps <T, U> = Exclude<{
    [K in keyof T]: T[K] extends U
      ? K
      : undefined
  }[keyof T], undefined>;

export type RestrictObj <T, U> = {
    [K in RestrictProps<T, U>]: U;
};

export type ReplaceReturnType<T extends (...a:any) => any, TNewReturn> = (...a:Parameters<T>) => TNewReturn;

export function safePropExpr (obj:string, prop:string|number|Symbol) {
    if (typeof prop === 'string') {
        return `${obj}.${prop}`;
    } else if (typeof prop === 'number') {
        return `${obj}[${prop}]`;
    } else if (typeof prop === 'symbol') {
        throw new Error('symbol not supported');
    }
    return '';
}

export function safeReadBoolExpr (propExpr:string) {
    return `(!!${propExpr})`;
}

export function safeReadNumExpr (propExpr:string, minVal:number, maxVal:number) {
    let readExpr = `(+${propExpr} || 0)`;
    if (minVal !== -Infinity) {
        readExpr = `Math.max(${minVal}, ${readExpr})`;
    }
    if (maxVal !== Infinity) {
        readExpr = `Math.min(${maxVal}, ${readExpr})`;
    }
    return readExpr;
}

export function safeReadStrExpr (propExpr:string) {
    return `('' + ${propExpr})`;
}