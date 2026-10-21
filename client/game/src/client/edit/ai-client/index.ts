import { UIMessage } from '@ai-sdk/react';
import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { AiProtocol } from '@box/schema/ai/ai-protocol.schema';
import type { AiGenerateOptions } from '@box/schema/ai/ai.types';
import { UIMessageChunk } from 'ai';
import { nanoid } from 'nanoid';
import type { Logger } from 'pino';
import { store } from 'src/redux/edit';
import { updateUserInfo } from 'src/redux/slices/user';

/**
 * AI 待处理请求（内部类）
 */
interface PendingRequest {
  id: string;
  content: string;
  error: string;
  model: string;
  streamController?: ReadableStreamDefaultController<UIMessageChunk>;
}

// 基础类型守卫：对象且具有 string 类型的 type 字段
function isUIMessageChunk(x: unknown): x is UIMessageChunk {
  return (
    typeof x === 'object' &&
    x !== null &&
    'type' in x &&
    typeof x.type === 'string'
  );
}

// 文本增量分片的类型守卫
function isTextDelta(x: unknown): x is { type: 'text-delta'; text: string } {
  return (
    isUIMessageChunk(x) &&
    x.type === 'text-delta' &&
    typeof (x as any).text === 'string'
  );
}

/**
 * AI 客户端类
 * 负责处理通过 MuDB 协议与服务器通信的 AI 功能
 * 管理对话历史和待处理请求，为每个请求提供 ReadableStream
 */
export class AiClient {
  private _protocol: MuClientProtocol<typeof AiProtocol>;
  private _logger: Logger;
  // 将待处理请求从公共状态迁移到私有属性
  private _pendingRequests = new Map<string, PendingRequest>();

  constructor(spec: { client: MuClient; logger: Logger }) {
    const protocol = (this._protocol = spec.client.protocol(AiProtocol));
    this._logger = spec.logger;

    // 配置协议消息处理器
    protocol.configure({
      message: {
        // 处理错误响应
        error: ({ requestId, message }) => {
          this._handleError(requestId, message);
        },

        // 处理流式响应块
        streamChunk: ({ requestId, chunk, done }) => {
          this._handleStreamChunk(requestId, chunk, done);
        },

        // 处理余额更新
        creditUpdate: ({ balance }) => {
          // 更新 Redux store
          store.dispatch(updateUserInfo({ credits: Number(balance) }));
        },
      },
    });
  }

  /**
   * 处理错误响应
   */
  private _handleError(id: string, message: string): void {
    const pendingRequest = this._pendingRequests.get(id);

    if (!pendingRequest) {
      this._logger.warn(`[AIClient] 找不到ID为 ${id} 的待处理请求`);
      return;
    }

    // 标记请求错误并通知流消费者
    pendingRequest.error = message;
    if (pendingRequest.streamController) {
      pendingRequest.streamController.error(new Error(message));
    }
    // 清理资源，避免泄漏
    this._pendingRequests.delete(id);
  }

  /**
   * 处理流式响应块
   */
  private _handleStreamChunk(id: string, chunk: string, done: boolean): void {
    const pendingRequest = this._pendingRequests.get(id);

    if (!pendingRequest) {
      this._logger.warn(`[AIClient] 找不到ID为 ${id} 的待处理请求`);
      return;
    }

    if (!pendingRequest.streamController) {
      return;
    }

    if (done) {
      this._finishStream(pendingRequest);
      return;
    }

    try {
      this._logger.debug(chunk, 'Received chunk:');
      const part: unknown = JSON.parse(chunk);
      // 进行最小结构校验，确保有 type 字段
      if (isUIMessageChunk(part)) {
        pendingRequest.streamController.enqueue(part);
        // 累积文本内容用于历史记录
        if (isTextDelta(part)) {
          pendingRequest.content += part.text;
        }
      } else {
        this._logger.warn(part, '[AIClient] Invalid chunk structure received');
      }
    } catch (e) {
      this._logger.error({ err: e }, '[AIClient] Failed to parse chunk');
    }
  }

  /**
   * 结束流式请求
   */
  private _finishStream(pendingRequest: PendingRequest): void {
    if (pendingRequest.streamController) {
      pendingRequest.streamController.close();
    }
    this._pendingRequests.delete(pendingRequest.id);
  }

  /**
   * 发送聊天消息
   * @param messages 完整的消息历史 (JSON 字符串或对象数组)
   * @param options 生成选项
   * @returns 返回一个 ReadableStream，对话框模块可以消费流式数据
   */
  public sendMessage(
    messages: UIMessage[],
    options: AiGenerateOptions,
  ): { requestId: string; stream: ReadableStream<UIMessageChunk> } {
    const requestId = nanoid();

    // 创建待处理请求
    const pendingRequest: PendingRequest = {
      id: requestId,
      content: '',
      error: '',
      model: options.model,
    };

    // 创建 ReadableStream
    const stream = new ReadableStream<UIMessageChunk>({
      start: (controller) => {
        pendingRequest.streamController = controller;
      },
    });

    this._pendingRequests.set(requestId, pendingRequest);

    // 序列化消息
    const messagesStr =
      typeof messages === 'string' ? messages : JSON.stringify(messages);

    // 发送请求到服务器
    this._protocol.server.message.sendMessage({
      requestId,
      messages: messagesStr,
      model: options.model,
    });

    return { requestId, stream };
  }

  /**
   * 中止生成
   */
  public abort(requestId: string): void {
    const pendingRequest = this._pendingRequests.get(requestId);
    if (pendingRequest) {
      // 发送中止消息到服务器
      this._protocol.server.message.abort({ requestId });

      // 结束本地流
      this._finishStream(pendingRequest);
      this._pendingRequests.delete(requestId);
    }
  }
}
