import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuJSON } from '@box/mudb/schema/json';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
export declare const PostMessageScriptSchema: MuStruct<{
    type: MuUTF8;
    value: MuStruct<any>;
    isOld: MuBoolean;
}>;
export type PostMessageScriptType = typeof PostMessageScriptSchema.identity;
export interface NavigatorEventListener {
    (event: MessageEventType): void;
}
export declare const PostMessageSchema: MuStruct<{
    type: MuUTF8;
    value: MuUTF8;
    isOld: MuBoolean;
}>;
export type PostMessageType = typeof PostMessageSchema.identity;
export declare const ClipboardSchema: MuStruct<{
    text: MuUTF8;
}>;
export declare const MessageEventSchema: MuStruct<{
    data: MuJSON;
}>;
export type MessageEventType = typeof MessageEventSchema.identity;
export declare const NavigatorSchema: MuStruct<{
    postMessage: MuStruct<{
        type: MuUTF8;
        value: MuUTF8;
        isOld: MuBoolean;
    }>;
}>;
export type NavigatorType = typeof NavigatorSchema.identity;
