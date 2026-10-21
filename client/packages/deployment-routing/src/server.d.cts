declare const prefixServer:{
    install():void;
    html(source:string, config?:{ basePath:string; peerPaths:string[] }):string;
    configuration():{ basePath:string; peerPaths:string[] };
    css(source:string, config?:{ basePath:string; peerPaths:string[] }):string;
    imageRequest(source:string, config?:{ basePath:string; peerPaths:string[] }):string;
};
export = prefixServer;
