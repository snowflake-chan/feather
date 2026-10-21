declare function publicPath(value:string, overrideBase?:string, overridePeers?:string[]):string;
declare function srcSet(value:string, base?:string, peers?:string[]):string;
declare function basePath():string;
declare function props<T>(type:unknown, original:T):T;
export { publicPath, srcSet, basePath, props };
