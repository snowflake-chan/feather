import type { Logger } from 'pino';
import type { GameClientState } from 'src/engine/game-client-schema';
import { FastGptChatChunk, parseFastGptStreamResponse } from './fast-gpt';

// 定义消息类型
export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: CodeActionType;
}

// 定义消息处理器类型
export type MessageHandler = (messageList: ReadonlyArray<AiMessage>) => void;

export type CodeActionType =
  | 'code:explain'
  | 'code:debug'
  | 'code:opti'
  | 'code:comment'
  | 'code:refactor';
export const CodeActionPrompts = {
  'code:explain':
    '请详细解释这段代码的功能和实现原理，包括核心逻辑、算法思路和关键部分的具体作用',
  'code:debug':
    '我需要你帮我找出代码中的错误，并给出修复建议。请详细说明错误原因和修复方案，如有类型错误，须使用jsdoc加上类型注释',
  'code:opti':
    '请帮我优化这段代码，提高执行效率、可读性和可维护性。可以从算法复杂度、代码结构、命名规范等多方面给出建议，如有类型错误，须使用jsdoc加上类型注释',
  'code:comment':
    '请为这段代码添加全面的注释，使其更易于理解和维护。注释应包括函数用途、参数说明、返回值、实现逻辑等关键信息，如有类型错误，须使用jsdoc加上类型注释',
  'code:refactor':
    '请帮我重构这个较长的函数，将其分解为多个小函数，提高代码的可读性和可维护性。保持原有功能不变，如有类型错误，须使用jsdoc加上类型注释',
};

/**
 * Ai 流程控制器
 * 一次只会发一个请求，并处理流式响应
 */
export class AiController {
  private activeController: AbortController | undefined = undefined;
  public readonly currentMessages: AiMessage[] = [
    {
      role: 'assistant',
      content:
        'HI！我是精通BOX3API的AI助手🥰\n请在下方输入您的问题，我会尽力帮助您。✨',
    },
  ];

  // 节流控制参数
  private throttleConfig = {
    bufferSize: 10, // 累积10个字符更新一次
    interval: 100, // 每100ms更新一次
  };

  constructor(
    private gameState: GameClientState,
    private logger: Logger,
  ) {}

  /**
   * 发送聊天消息并处理流式响应
   */
  public async sendChatStreamMessage(params: {
    content: string;
    userMessage: AiMessage;
    messageHandler: MessageHandler;
  }) {
    // 如果有正在进行的请求，先取消它
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = undefined;
    }

    // 创建并存储当前控制器引用
    const controller = new AbortController();
    this.activeController = controller;

    // 将用户消息添加到消息列表
    this.currentMessages.push(params.userMessage);

    // 创建助手消息
    const assistantMessage: AiMessage = {
      role: 'assistant',
      content: '正在处理，请稍等...',
    };

    // 将助手的临时消息添加到消息列表
    this.currentMessages.push(assistantMessage);

    // 调用消息处理器，通知外部消息列表已更新
    params.messageHandler(this.currentMessages);

    // 为流式响应处理设置状态
    const state = {
      answer: '',
      buffer: '',
      lastUpdateTime: Date.now(),
    };

    // 创建用于处理流式响应的函数
    const chunkHandler = (chunk: FastGptChatChunk) => {
      try {
        // 处理流式响应数据
        if (chunk.choices[0].finish_reason === 'stop') {
          this.updateAssistantMessage(
            assistantMessage,
            chunk.choices[0].message.content,
            params.messageHandler,
          );
        } else {
          // 累积响应内容
          state.buffer += chunk.choices[0].delta.content || '';

          // 实现节流: 每100ms更新一次或累积10个字符
          const now = Date.now();
          if (
            now - state.lastUpdateTime > this.throttleConfig.interval ||
            state.buffer.length > this.throttleConfig.bufferSize
          ) {
            state.answer += state.buffer;
            state.buffer = '';
            state.lastUpdateTime = now;

            // 更新助手消息内容
            this.updateAssistantMessage(
              assistantMessage,
              state.answer,
              params.messageHandler,
            );
          }
        }
      } catch (err) {
        this.logger.error('处理AI响应时出错:', err);
      }
    };

    try {
      const response = await fetch('/api/ai/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: params.content,
        }),
        signal: controller.signal,
      });

      if (!response) {
        this.updateAssistantMessage(
          assistantMessage,
          '请求失败，请稍后重试',
          params.messageHandler,
        );
        return;
      }

      await parseFastGptStreamResponse(response, chunkHandler);

      // 确保最后的缓冲内容也被显示
      if (state.buffer) {
        state.answer += state.buffer;
        this.updateAssistantMessage(
          assistantMessage,
          state.answer,
          params.messageHandler,
        );
      }

      return this.currentMessages;
    } catch (e) {
      if (e.name === 'AbortError') {
        this.logger.trace('AI request aborted');
        this.updateAssistantMessage(
          assistantMessage,
          '请求已取消',
          params.messageHandler,
        );
        return this.currentMessages;
      }
      this.logger.error('发送AI请求时出错:', e);
      this.updateAssistantMessage(
        assistantMessage,
        '请求出错，请稍后重试',
        params.messageHandler,
      );
      throw e;
    } finally {
      if (this.activeController === controller) {
        this.activeController = undefined;
      }
    }
  }

  /**
   * 更新助手消息并通知外部
   */
  private updateAssistantMessage(
    message: AiMessage,
    content: string,
    messageHandler: MessageHandler,
  ) {
    message.content = content;
    messageHandler(this.currentMessages);
  }

  /**
   * 发送代码相关查询
   */
  public async sendChatCodeExplain(params: {
    content: string;
    userMessage: AiMessage;
    messageHandler: MessageHandler;
    type: CodeActionType;
  }) {
    // 根据类型添加提示词
    const enhancedContent = CodeActionPrompts[params.type] + params.content;

    return this.sendChatStreamMessage({
      content: enhancedContent,
      userMessage: params.userMessage,
      messageHandler: params.messageHandler,
    });
  }

  /**
   * 统一的聊天消息发送接口
   */
  public async sendChat(
    params:
      | {
          type: undefined;
          content: string;
          userMessage: AiMessage;
          messageHandler: MessageHandler;
        }
      | {
          type: CodeActionType;
          content: string;
          userMessage: AiMessage;
          messageHandler: MessageHandler;
        },
  ) {
    if (params.type) {
      return this.sendChatCodeExplain({
        content: params.content,
        userMessage: params.userMessage,
        messageHandler: params.messageHandler,
        type: params.type,
      });
    }

    return this.sendChatStreamMessage({
      content: params.content,
      userMessage: params.userMessage,
      messageHandler: params.messageHandler,
    });
  }

  public stopCurrentChat() {
    if (this.activeController) {
      this.logger.info('Aborting active chat request');
      this.activeController.abort();
      this.activeController = undefined;
      return true;
    }
    return false;
  }
}
