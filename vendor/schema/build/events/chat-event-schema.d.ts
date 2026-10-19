import { MuStruct, MuArray, MuInt32, MuUTF8, MuBoolean, MuSchema } from '@box/mudb/schema';
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
//# sourceMappingURL=chat-event-schema.d.ts.map