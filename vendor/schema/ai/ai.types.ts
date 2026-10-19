/**
 * 聊天消息角色类型
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * 模型完成原因
 * - stop: 自然完成
 * - length: 达到最大 token 限制
 * - content_filter: 内容被过滤
 * - tool_calls: 触发工具调用
 */

/**
 * 聊天消息接口
 */
export interface AiChatMessage {
  /** 消息角色: 'user'(用户), 'assistant'(助手), 'system'(系统) */
  role: ChatRole;
  /** 消息内容 */
  content: string;
}

/**
 * LLM 生成选项
 */
export interface AiGenerateOptions {
  /** 模型名称，如不指定则使用默认模型 */
  model: 'FAST' | 'PRO';
}
