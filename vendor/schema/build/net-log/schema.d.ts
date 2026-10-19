import { MuStruct, MuVarint, MuUTF8, MuASCII, MuArray, MuJSON } from '@box/mudb/schema';
export declare const NetLogEventSchema: MuJSON;
export type NetLogEvent = typeof NetLogEventSchema.identity;
export declare const NetLogSchema: {
    name: string;
    client: {
        log: MuStruct<{
            uuid: MuASCII;
            level: import("@box/mudb/schema").MuSchema<import("@box/utils/logger").LogLevel>;
            timestamp: import("@box/mudb/schema").MuDate;
            prefix: MuArray<MuASCII>;
            message: MuUTF8;
        }>;
    };
    server: {
        log: MuStruct<{
            level: MuVarint;
            prefix: MuArray<MuASCII>;
            message: MuUTF8;
        }>;
        logASCII: MuStruct<{
            level: MuVarint;
            prefix: MuArray<MuASCII>;
            message: MuASCII;
        }>;
        logPino: MuJSON;
    };
};
//# sourceMappingURL=schema.d.ts.map