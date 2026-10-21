"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProtocol = exports.AiStreamChunkSchema = exports.AiErrorSchema = void 0;
const schema_1 = require("@box/mudb/schema");
/**
 * 错误响应
 */
exports.AiErrorSchema = new schema_1.MuStruct({
    // 请求ID
    requestId: new schema_1.MuUTF8(),
    // 错误信息
    message: new schema_1.MuUTF8(),
});
/**
 * 流式响应块
 */
exports.AiStreamChunkSchema = new schema_1.MuStruct({
    // 请求ID
    requestId: new schema_1.MuUTF8(),
    // 流式内容块
    chunk: new schema_1.MuUTF8(),
    done: new schema_1.MuBoolean(false),
});
/**
 * AI 对话协议定义
 * 遵循 MuDB 协议规范，定义客户端和服务器之间的消息类型
 */
exports.AiProtocol = {
    name: 'ai',
    // 客户端接收的消息类型
    client: {
        // 接收错误响应
        error: exports.AiErrorSchema,
        // 接收流式响应块
        streamChunk: exports.AiStreamChunkSchema,
        // 接收余额更新
        creditUpdate: new schema_1.MuStruct({
            balance: new schema_1.MuVarint(),
        }),
    },
    // 服务器接收的消息类型
    server: {
        // 发送聊天消息
        sendMessage: new schema_1.MuStruct({
            // 请求ID (客户端生成)
            requestId: new schema_1.MuUTF8(),
            // 完整的消息历史 (JSON 字符串)
            messages: new schema_1.MuUTF8(),
            // 模型选择, 目前支持 FAST 或 PRO
            model: new schema_1.MuUTF8(),
        }),
        // 中断生成
        abort: new schema_1.MuStruct({
            requestId: new schema_1.MuUTF8(),
        }),
    },
};
//# sourceMappingURL=ai-protocol.schema.js.map