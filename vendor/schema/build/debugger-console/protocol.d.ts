import { MuBoolean, MuStruct, MuUTF8, MuUint8, MuVarint, MuVoid } from '@box/mudb/schema';
export declare const DebuggerProtocol: {
    name: string;
    client: {
        updateLog: MuStruct<{
            level: MuUint8;
            message: MuUTF8;
        }>;
        scriptException: MuStruct<{
            name: MuUTF8;
            message: MuUTF8;
            stack: import("@box/mudb/schema").MuArray<MuStruct<{
                function: MuUTF8;
                file: MuUTF8;
                line: import("@box/mudb/schema").MuUint32;
                column: import("@box/mudb/schema").MuUint32;
                source: MuUTF8;
                isolate: MuBoolean;
            }>>;
        }>;
        scriptEvalResult: MuStruct<{
            token: MuVarint;
            error: MuBoolean;
            result: MuUTF8;
        }>;
        clearLog: MuVoid;
    };
    server: {
        scriptEval: MuStruct<{
            token: MuVarint;
            expr: MuUTF8;
        }>;
        /** Browser-side script output, relayed to the editor and Creator CLI. */
        clientLog: MuStruct<{
            level: MuUint8;
            message: MuUTF8;
        }>;
        clientException: MuStruct<{
            name: MuUTF8;
            message: MuUTF8;
            stack: import("@box/mudb/schema").MuArray<MuStruct<{
                function: MuUTF8;
                file: MuUTF8;
                line: import("@box/mudb/schema").MuUint32;
                column: import("@box/mudb/schema").MuUint32;
                source: MuUTF8;
                isolate: MuBoolean;
            }>>;
        }>;
        clientClearLog: MuVoid;
    };
};
//# sourceMappingURL=protocol.d.ts.map