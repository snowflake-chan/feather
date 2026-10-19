import { MuBoolean, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';
/**
 * 错误响应
 */
export declare const AiErrorSchema: MuStruct<{
    requestId: MuUTF8;
    message: MuUTF8;
}>;
/**
 * 流式响应块
 */
export declare const AiStreamChunkSchema: MuStruct<{
    requestId: MuUTF8;
    chunk: MuUTF8;
    done: MuBoolean;
}>;
/**
 * AI 对话协议定义
 * 遵循 MuDB 协议规范，定义客户端和服务器之间的消息类型
 */
export declare const AiProtocol: {
    name: string;
    client: {
        error: MuStruct<{
            requestId: MuUTF8;
            message: MuUTF8;
        }>;
        streamChunk: MuStruct<{
            requestId: MuUTF8;
            chunk: MuUTF8;
            done: MuBoolean;
        }>;
        creditUpdate: MuStruct<{
            balance: MuVarint;
        }>;
    };
    server: {
        sendMessage: MuStruct<{
            requestId: MuUTF8;
            messages: MuUTF8;
            model: MuUTF8;
        }>;
        abort: MuStruct<{
            requestId: MuUTF8;
        }>;
    };
};
//# sourceMappingURL=ai-protocol.schema.d.ts.map