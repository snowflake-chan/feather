import { MuBoolean, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';

/**
 * 错误响应
 */
export const AiErrorSchema = new MuStruct({
  // 请求ID
  requestId: new MuUTF8(),
  // 错误信息
  message: new MuUTF8(),
});

/**
 * 流式响应块
 */
export const AiStreamChunkSchema = new MuStruct({
  // 请求ID
  requestId: new MuUTF8(),
  // 流式内容块
  chunk: new MuUTF8(),
  done: new MuBoolean(false),
});

/**
 * AI 对话协议定义
 * 遵循 MuDB 协议规范，定义客户端和服务器之间的消息类型
 */
export const AiProtocol = {
  name: 'ai',
  // 客户端接收的消息类型
  client: {
    // 接收错误响应
    error: AiErrorSchema,
    // 接收流式响应块
    streamChunk: AiStreamChunkSchema,
    // 接收余额更新
    creditUpdate: new MuStruct({
      balance: new MuVarint(),
    }),
  },
  // 服务器接收的消息类型
  server: {
    // 发送聊天消息
    sendMessage: new MuStruct({
      // 请求ID (客户端生成)
      requestId: new MuUTF8(),
      // 完整的消息历史 (JSON 字符串)
      messages: new MuUTF8(),
      // 模型选择, 目前支持 FAST 或 PRO
      model: new MuUTF8(),
    }),
    // 中断生成
    abort: new MuStruct({
      requestId: new MuUTF8(),
    }),
  },
};
