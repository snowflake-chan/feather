declare function configure<T>(
    config:T,
    options:{ isServer:boolean; dir:string; webpack:unknown },
):T;
export = configure;
