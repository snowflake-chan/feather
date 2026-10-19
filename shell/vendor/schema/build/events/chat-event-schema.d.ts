import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuInt32 } from '@box/mudb/schema/int32';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MsgType } from '../chat/chat-schema';
export declare const ChatLogEventSchema: MuStruct<{
    senderId: MuInt32;
    targetId: MuInt32;
    name: MuUTF8;
    msgType: MuSchema<MsgType>;
    message: MuUTF8;
    private: MuBoolean;
    duration: MuInt32;
}>;
export declare const ChatEventSchema: MuStruct<{
    chats: MuArray<MuStruct<{
        senderId: MuInt32;
        targetId: MuInt32;
        name: MuUTF8;
        msgType: MuSchema<MsgType>;
        message: MuUTF8;
        private: MuBoolean;
        duration: MuInt32;
    }>>;
}>;
