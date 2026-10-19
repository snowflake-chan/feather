import { MuStruct, MuUTF8, MuVarint, MuASCII } from '@box/mudb/schema';
export declare const PublishRPCSchema: MuStruct<{
    token: MuVarint;
    shortname: MuASCII;
}>;
export declare const CancelPublishRPCSchema: MuStruct<{
    token: MuVarint;
}>;
export declare const SaveGameRPCSchema: MuStruct<{
    token: MuVarint;
    saveAs: MuUTF8;
}>;
export declare const PublishProtocol: {
    name: string;
    client: {
        init: MuStruct<{
            gameId: MuVarint;
        }>;
        rpcResponse: MuStruct<{
            token: MuVarint;
            result: MuUTF8;
            error: MuUTF8;
        }>;
    };
    server: {
        saveGame: MuStruct<{
            token: MuVarint;
            saveAs: MuUTF8;
        }>;
    };
};
//# sourceMappingURL=publish-schema.d.ts.map