import { UIMessage } from '@ai-sdk/react';
import type { ChatRequestOptions, ChatTransport, UIMessageChunk } from 'ai';
import type { Logger } from 'pino';
import type { AiClient } from '../../client/edit/ai-client';

/**
 * 待处理流的状态
 */
interface PendingStreamState {
  /** 服务器端的消息 ID */
  serverMessageId: string;
  /** 原始流（只能读取一次） */
  originalStream: ReadableStream<UIMessageChunk>;
  /** 流的状态 */
  status: 'streaming' | 'completed' | 'error';
  /** 创建时间戳（用于清理过期流） */
  createdAt: number;
}

/**
 * MuTransport - 基于 MuDB 协议的 ChatTransport 实现
 *
 * 功能：
 * - 将 UIMessage[] 通过 AiClient 发送到服务器
 * - 接收服务器返回的 ReadableStream<UIMessageChunk>
 * - 支持 abortSignal 中止请求
 * - 支持流重连（resume）机制
 * - 自动管理流的生命周期和资源清理
 */
export class MuTransport implements ChatTransport<UIMessage> {
  /**
   * AI 客户端控制器实例
   */
  private aiClient: AiClient;

  /**
   * 日志记录器
   */
  private logger: Logger;

  /**
   * 待处理的消息流 Map (用于重连)
   * Key: chatId, Value: PendingStreamState
   * 注意：一个 chat 同时只对应一个待处理消息
   */
  private pendingStreams = new Map<string, PendingStreamState>();

  /**
   * 流超时时间（毫秒）- 超过此时间的流将被清理
   */
  private readonly STREAM_TIMEOUT = 5 * 60 * 1000; // 5分钟

  constructor(spec: { aiClient: AiClient; logger: Logger }) {
    this.aiClient = spec.aiClient;
    this.logger = spec.logger;

    // 定期清理过期的流
    this.startCleanupTimer();
  }

  /**
   * 发送消息并返回可读流
   *
   * @param options 发送选项
   * @returns 返回一个 ReadableStream<UIMessageChunk>
   */
  public async sendMessages(
    options: {
      /** 提交类型：新消息或重新生成 */
      trigger: 'submit-message' | 'regenerate-message';
      /** 聊天会话ID */
      chatId: string;
      /** 要重新生成的消息ID，新消息则为 undefined */
      messageId: string | undefined;
      /** 对话历史 */
      messages: UIMessage[];
      /** 中止信号 */
      abortSignal: AbortSignal | undefined;
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    this.logger.debug(
      { chatId: options.chatId },
      '[MuTransport] Sending messages',
    );

    // 清理之前的流（如果存在）
    const existingStream = this.pendingStreams.get(options.chatId);
    if (existingStream) {
      this.logger.debug(
        { chatId: options.chatId },
        '[MuTransport] Clearing previous stream',
      );
      this.pendingStreams.delete(options.chatId);
    }

    const { requestId: serverMessageId, stream: uiStream } =
      this.aiClient.sendMessage(options.messages, {
        model: options.body?.['model'],
      });

    // 如果信号已中止，立即处理
    if (options.abortSignal?.aborted) {
      this.logger.debug(
        { chatId: options.chatId },
        '[MuTransport] Aborted before stream creation',
      );
      this.aiClient.abort(serverMessageId);
      return new ReadableStream({
        start(controller) {
          controller.close();
        },
      });
    }

    // 存储流状态用于可能的重连
    this.pendingStreams.set(options.chatId, {
      serverMessageId,
      originalStream: uiStream,
      status: 'streaming',
      createdAt: Date.now(),
    });

    // 转换 AI 流为 ChatTransport 期望的格式
    const transformedStream = this._transformStream(
      uiStream,
      options.chatId,
      serverMessageId,
      options.abortSignal,
    );

    return transformedStream;
  }

  /**
   * 重新连接到已有流
   *
   * TODO 目前暂不支持流重连，直接返回 null。
   * 这将导致 useChat 在页面刷新或重连时不会尝试恢复之前的流。
   */
  public async reconnectToStream(
    options: { chatId: string; abortSignal?: AbortSignal } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }

  /**
   * 将 AI 流转换为 ChatTransport 期望的格式
   *
   * AI 客户端已输出 UIMessageChunk (text-start, text-delta, text-end)
   * 这里主要处理：
   * 1. 透传消息块
   * 2. 处理 abort 信号
   * 3. 更新流状态
   * 4. 清理资源
   *
   * @param uiStream 原始的 UI 消息流
   * @param chatId 聊天 ID
   * @param serverMessageId 服务器消息 ID
   * @param abortSignal 可选的中止信号
   * @returns 转换后的流
   */
  private _transformStream(
    uiStream: ReadableStream<UIMessageChunk>,
    chatId: string,
    serverMessageId: string,
    abortSignal: AbortSignal | undefined,
  ): ReadableStream<UIMessageChunk> {
    const self = this;
    let abortListener: (() => void) | undefined;

    // 创建一个 transform stream，用于处理中止信号和状态更新
    const transform = new TransformStream<UIMessageChunk, UIMessageChunk>({
      start(controller) {
        // 在流开始时注册 abort 监听器
        if (abortSignal) {
          abortListener = () => {
            self.logger.debug(
              { chatId, serverMessageId },
              '[MuTransport] Stream aborted',
            );
            self.aiClient.abort(serverMessageId);
            controller.terminate();

            // 更新流状态
            const streamState = self.pendingStreams.get(chatId);
            if (streamState) {
              streamState.status = 'error';
            }
          };

          if (abortSignal.aborted) {
            abortListener();
          } else {
            abortSignal.addEventListener('abort', abortListener);
          }
        }
      },

      transform(
        chunk: UIMessageChunk,
        controller: TransformStreamDefaultController<UIMessageChunk>,
      ) {
        // 透传消息块
        controller.enqueue(chunk);
      },

      flush() {
        // 流结束时清理 abort 监听器
        if (abortListener && abortSignal) {
          abortSignal.removeEventListener('abort', abortListener);
        }
      },
    });

    // 监听流完成或错误
    uiStream.pipeTo(transform.writable).then(
      () => {
        // 流成功完成，更新状态并清理
        self.logger.debug(
          { chatId, serverMessageId },
          '[MuTransport] Stream completed successfully',
        );
        const streamState = self.pendingStreams.get(chatId);
        if (streamState) {
          streamState.status = 'completed';
        }
        // 延迟删除，给重连一些时间窗口
        setTimeout(() => {
          self.pendingStreams.delete(chatId);
        }, 1000);
      },
      (error) => {
        // 流出错，记录日志并清理
        self.logger.error(
          { chatId, serverMessageId, error },
          '[MuTransport] Stream error',
        );
        const streamState = self.pendingStreams.get(chatId);
        if (streamState) {
          streamState.status = 'error';
        }
        self.pendingStreams.delete(chatId);
      },
    );

    return transform.readable;
  }

  /**
   * 启动定时器，定期清理过期的流
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [chatId, streamState] of this.pendingStreams.entries()) {
        const age = now - streamState.createdAt;
        if (age > this.STREAM_TIMEOUT) {
          this.logger.warn(
            { chatId, age, status: streamState.status },
            '[MuTransport] Cleaning up expired stream',
          );
          this.pendingStreams.delete(chatId);
        }
      }
    }, 60 * 1000); // 每分钟检查一次
  }

  /**
   * 清理所有待处理的流（用于组件卸载）
   */
  public dispose(): void {
    this.logger.debug(
      { count: this.pendingStreams.size },
      '[MuTransport] Disposing all pending streams',
    );
    this.pendingStreams.clear();
  }
}
