export declare const NavigatorProtocol: {
    name: string;
    client: {
        postMessage: import("@box/mudb/schema").MuStruct<{
            type: import("@box/mudb/schema").MuUTF8;
            value: import("@box/mudb/schema").MuUTF8;
            isOld: import("@box/mudb/schema").MuBoolean;
        }>;
    };
    server: {
        messageEvent: import("@box/mudb/schema").MuStruct<{
            data: import("@box/mudb/schema").MuJSON;
        }>;
    };
};
//# sourceMappingURL=navigator-protocol.d.ts.map