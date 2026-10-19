import { MuBoolean, MuStruct, MuUTF8, MuVarint, MuVoid } from '@box/mudb/schema';
export declare const GUIProtocol: {
    name: string;
    client: {
        init: MuStruct<{
            handle: MuVarint;
            data: MuUTF8;
        }>;
        append: MuStruct<{
            handle: MuVarint;
            selector: MuUTF8;
            data: MuUTF8;
        }>;
        remove: MuStruct<{
            handle: MuVarint;
            selector: MuUTF8;
        }>;
        show: MuStruct<{
            handle: MuVarint;
            name: MuUTF8;
            allowMultiple: MuBoolean;
        }>;
        getAttribute: MuStruct<{
            handle: MuVarint;
            selector: MuUTF8;
            name: MuUTF8;
        }>;
        setAttribute: MuStruct<{
            handle: MuVarint;
            selector: MuUTF8;
            name: MuUTF8;
            value: MuUTF8;
        }>;
        reset: MuVoid;
    };
    server: {
        return: MuStruct<{
            handle: MuVarint;
            value: MuUTF8;
        }>;
        throw: MuStruct<{
            handle: MuVarint;
            message: MuUTF8;
        }>;
        sendMessage: MuStruct<{
            name: MuUTF8;
            payload: MuUTF8;
        }>;
    };
};
//# sourceMappingURL=gui-protocol.d.ts.map