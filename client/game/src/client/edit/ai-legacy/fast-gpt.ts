export type FastGptChatChunk = FastGptChatMessageChunk | FastGptChatStopChunk;

export interface FastGptChatMessageChunk {
  id: string;
  object: string;
  created: number;
  choices: {
    delta: {
      content: string;
    };
    index: number;
    finish_reason: null;
  }[];
}

export interface FastGptChatStopChunk {
  id: string;
  object: string;
  created: number;
  choices: {
    message: {
      content: string;
    };
    index: number;
    finish_reason: 'stop';
  }[];
}

const DECODER = new TextDecoder();
export async function parseFastGptStreamResponse(
  response: Response,
  chunkHandler: (chunk: FastGptChatChunk) => void,
) {
  if (response.body === null) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();

  try {
    let buffer = ''; // 用于处理跨块的不完整JSON

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 处理可能剩余的缓冲区内容
        if (buffer.trim()) {
          try {
            const trimmedBuffer = buffer.trim();
            if (trimmedBuffer.startsWith('data: ')) {
              const chunk: FastGptChatChunk = JSON.parse(
                trimmedBuffer.substring(6).trim(),
              );
              chunkHandler(chunk);
            }
          } catch (e) {
            console.warn('处理流结束时的不完整数据时出错:', e);
          }
        }
        break;
      }

      const text = DECODER.decode(value);
      buffer += text;

      // 按照SSE格式处理数据
      const lines = buffer.split('\n');
      buffer = ''; // 重置缓冲区

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6).trim();
            if (jsonStr && jsonStr !== '[DONE]') {
              const chunk: FastGptChatChunk = JSON.parse(jsonStr);
              chunkHandler(chunk);
            }
          } catch (error) {
            // 可能是不完整的JSON，将其放回缓冲区
            buffer = line;
          }
        } else if (line === '') {
          // 空行，忽略
        } else {
          // 可能是不完整的行或其他格式内容，放回缓冲区
          buffer += line;
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('流读取已被中止');
    } else {
      console.error('解析流响应时出错:', error);
      throw error;
    }
  } finally {
    // 确保释放流资源
    try {
      await reader.cancel();
    } catch (e) {
      // 忽略取消时的错误
    }
  }
}
