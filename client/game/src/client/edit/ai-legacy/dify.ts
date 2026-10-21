export interface DifyChatMessageChunk {
  event: 'message' | 'message_end';
  /**
   * 任务 ID，用于请求跟踪和停止响应接口
   */
  task_id: string;
  conversation_id: string;
  message_id: string;
  /**
   * LLM 返回文本块内容
   */
  answer: string;
  created_at: number;
}

export interface DifyChatMessageEndChunk {
  event: 'message_end';
  /**
   * 任务 ID，用于请求跟踪和停止响应接口
   */
  task_id: string;
  conversation_id: string;
  message_id: string;
  metadata: {
    usage: number;
  };
}

export type DifyChatChunk = DifyChatMessageChunk | DifyChatMessageEndChunk;

export interface DifyChatParams {
  query: string;
  conversationId?: string;
  user: string;
  signal?: AbortSignal;
}
export function sendDifyChat(params: DifyChatParams) {
  const { query, conversationId } = params;
  return fetch('/api/dify/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId,
      query,
    }),
    signal: params.signal,
  });
}

const DECODER = new TextDecoder();
export async function parseDifyStreamResponse(
  response: Response,
  chunkHandler: (chunk: DifyChatChunk) => void,
) {
  if (response.body === null) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // TODO 处理收到的完整响应
      break;
    }

    const text = DECODER.decode(value);
    const chunks = text.split('data: ');

    chunks.forEach((part, index) => {
      if (index === 0) return;
      try {
        const chunk: DifyChatChunk = JSON.parse(part.trim());
        chunkHandler(chunk);
      } catch (error) {
        // 由于消息没有接受完整导致解析错误，跳过继续处理下一部分
      }
    });
  }
}

export function sendDifyChatStop(taskId: string) {
  return fetch(`/api/dify/chat-messages/${taskId}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
