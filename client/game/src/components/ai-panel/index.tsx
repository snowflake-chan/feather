'use client';

import { UIMessage, useChat } from '@ai-sdk/react';
import { CopyEvent, SourceType } from '@box/apis';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { ToolUIPart } from 'ai';
import { partition } from 'es-toolkit/array';
import {
  AlertCircle,
  Brain,
  CheckIcon,
  ChevronUp,
  MessageSquare,
  PlusIcon,
  X,
  Zap,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { DropdownMenu } from 'radix-ui';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useEdit } from 'src/client/edit/edit-context';
import { Streamdown } from 'streamdown';
import { apis } from '~/apis/local-api';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from '~/components/ai-elements/chain-of-thought';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '~/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '~/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '~/components/ai-elements/prompt-input';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '~/components/ai-elements/sources';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { clientConfig } from '~/config/client';
import { useLogger } from '~/hooks/use-logger';
import { MuTransport } from '../../lib/ai/mu-transport';
import { Loader } from '../ai-elements/loader';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '../ai-elements/tool';
import { InputPause, useInputPause } from '/src/views/components/input-lock';

// ==================== 类型定义 ====================

/** AI 消息类型，继承自 UI 消息 */
type BoxUiMessage = UIMessage;

/** 会话数据结构 */
interface ChatSession {
  /** 会话唯一标识 */
  id: string;
  /** 会话标题 */
  title: string;
  /** 会话消息列表 */
  messages: BoxUiMessage[];
}

/** 添加3D模型到项目的工具调用输入参数 */
interface AddModelToProjectInput {
  /** 要添加的模型 ID 列表 */
  modelIds: number[];
}

/** 添加模型操作的结果 */
interface AddModelToProjectResult {
  /** 是否成功 */
  success: boolean;
  /** 原始模型 ID */
  modelId: number;
  /** 新模型 ID（成功时） */
  newModelId?: number;
  /** 模型名称（成功时） */
  name?: string;
  /** 错误信息（失败时） */
  error?: string;
}

// ==================== 常量配置 ====================

/** 初始消息列表（空） */
const initialMessages: BoxUiMessage[] = [];

/** 可用的 AI 模型列表 */
const models: readonly string[] = ['FAST', 'PRO'];
interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}
const MODELS: ModelOption[] = [
  {
    id: 'FAST',
    name: 'FAST',
    description: 'Lightning fast response',
    icon: Zap,
    color: 'text-amber-400',
  },
  {
    id: 'PRO',
    name: 'PRO',
    description: 'Deep reasoning power',
    icon: Brain,
    color: 'text-violet-400',
  },
];

/** 新会话的默认标题 */
const NEW_CHAT_TITLE = 'New Chat';

/** 会话标题的最大长度 */
const MAX_TITLE_LENGTH = 20;

// ==================== 工具函数 ====================

/**
 * 类型守卫：判断消息部分是否为工具调用部分
 * @param part 消息部分对象
 * @returns 是否为工具调用部分
 */
function isToolPart(part: unknown): part is ToolUIPart {
  return (
    typeof part === 'object' &&
    part !== null &&
    'type' in part &&
    typeof part.type === 'string' &&
    part.type.startsWith('tool-')
  );
}

/**
 * AI 对话面板组件
 *
 * 功能包括：
 * - 多会话管理（创建、切换、自动命名）
 * - AI 模型选择
 * - 消息发送与接收
 * - 工具调用处理（如添加模型到项目）
 * - 错误处理与消息回退
 * - 输入暂停控制（与游戏输入协调）
 *
 * @returns AI 面板组件
 */
export const AiPanel = () => {
  const editClient = useEdit();
  const aiClient = editClient.ai;
  const logger = useLogger('AiPanel');

  const {
    messages,
    sendMessage,
    status,
    addToolOutput,
    stop,
    setMessages,
    error,
  } = useChat<BoxUiMessage>({
    transport: new MuTransport({
      aiClient,
      logger,
    }),
    messages: initialMessages,
    async onToolCall({ toolCall }) {
      // 动态工具调用需要外部处理，跳过
      if (toolCall.dynamic) {
        return;
      }

      // 工具：添加模型到当前项目
      if (toolCall.toolName === 'addModelToProject') {
        // 类型安全的输入参数提取
        const input = toolCall.input as AddModelToProjectInput;
        if (!input.modelIds || !Array.isArray(input.modelIds)) {
          addToolOutput({
            tool: 'addModelToProject',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: 'Invalid input: modelIds must be an array',
          });
          return;
        }
        const modelIds = input.modelIds;
        const mapId = clientConfig.mapInfo?.contentId;

        if (!mapId) {
          addToolOutput({
            tool: 'addModelToProject',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: 'Map ID not found',
          });
          toast.error('Failed to add models: Map ID not found');
          return;
        }

        // TODO 以后考虑显示在对话框中
        const toastId = toast.loading(`Adding ${modelIds.length} models...`);

        try {
          const results = await Promise.all(
            modelIds.map(async (modelId): Promise<AddModelToProjectResult> => {
              try {
                const res = await apis.model.copyProjectSharedModelUsingPost({
                  mapId,
                  originModelId: modelId,
                  sourceType: SourceType.Release,
                  event: CopyEvent.PassiveCopy,
                });
                return {
                  success: true,
                  modelId,
                  newModelId: res.modelId,
                  name: res.modelName,
                };
              } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                return { success: false, modelId, error: errorMessage };
              }
            }),
          );

          const successCount = results.filter((r) => r.success).length;
          const failures = results.filter((r) => !r.success);

          addToolOutput({
            tool: 'addModelToProject',
            toolCallId: toolCall.toolCallId,
            output: results,
          });

          if (failures.length > 0) {
            toast.error(
              `Added ${successCount} models. Failed: ${failures.length}`,
              { id: toastId },
            );
          } else {
            toast.success(`Successfully added ${successCount} models`, {
              id: toastId,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          addToolOutput({
            tool: 'addModelToProject',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: errorMessage,
          });
          toast.error(`Failed to add models: ${errorMessage}`, {
            id: toastId,
          });
        }
      }
    },
  });

  // ==================== 会话管理状态 ====================

  /** 所有会话列表 */
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: 'default', title: NEW_CHAT_TITLE, messages: [] },
  ]);

  /** 当前激活的会话 ID */
  const [currentSessionId, setCurrentSessionId] = useState<string>('default');

  /**
   * 同步消息到当前会话
   * - 当消息更新时，自动保存到对应会话
   * - 如果是新会话，根据首条用户消息自动生成标题
   */
  useEffect(() => {
    setSessions((prev) => {
      const currentSession = prev.find((s) => s.id === currentSessionId);
      if (!currentSession) return prev;

      // 检查消息是否真的变化了（避免不必要的更新）
      if (currentSession.messages === messages) return prev;

      let title = currentSession.title;
      // 自动生成标题：新会话且有用户消息时
      if (title === NEW_CHAT_TITLE && messages.length > 0) {
        const firstUserMessage = messages.find((m) => m.role === 'user');
        if (firstUserMessage) {
          const textPart = firstUserMessage.parts.find(
            (part) => part.type === 'text',
          );
          if (textPart && typeof textPart.text === 'string') {
            title = textPart.text.slice(0, MAX_TITLE_LENGTH);
          }
        }
      }

      return prev.map((s) =>
        s.id === currentSessionId ? { ...s, title, messages } : s,
      );
    });
  }, [messages, currentSessionId]);

  /**
   * 创建新会话
   * - 生成唯一 ID
   * - 添加到会话列表顶部
   * - 切换到新会话并清空消息
   */
  const handleCreateSession = useCallback(() => {
    const newId = nanoid();
    const newSession: ChatSession = {
      id: newId,
      title: NEW_CHAT_TITLE,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  }, [setMessages]);

  /**
   * 切换会话
   * - 加载对应会话的历史消息
   * - 更新当前会话 ID
   */
  const handleSessionChange = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        setMessages(session.messages);
      }
    },
    [sessions, setMessages],
  );

  // ==================== UI 状态 ====================

  /** 输入框文本内容 */
  const [text, setText] = useState<string>('');

  /** 是否显示错误提示 */
  const [showError, setShowError] = useState(false);

  /** 当前选中的模型 ID */
  const [model, setModel] = useState<string>(MODELS[0].id);

  /** 模型选择器是否打开 */
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  /** 当前选中的模型数据（计算属性） */
  const selectedModelData = useMemo(
    () => MODELS.find((m) => m.id === model) || MODELS[0],
    [model],
  );

  /** 输入是否暂停（与游戏输入协调） */
  const [isInputPause, setInputPause] = useState<boolean>(false);
  const { inputPauseChange } = useInputPause();

  /** 用于防止重复处理同一个错误 */
  const errorHandled = useRef(false);

  /**
   * 错误处理逻辑
   * - 显示错误提示
   * - 将失败的用户消息恢复到输入框
   * - 移除失败的消息交互记录
   */
  useEffect(() => {
    if (error && !errorHandled.current) {
      setShowError(true);
      errorHandled.current = true;

      // 查找最后一条用户消息
      const lastUserMessageIndex = messages.findLastIndex(
        (m) => m.role === 'user',
      );

      // 仅当最后一条用户消息在最近的交互中时才回退
      if (
        lastUserMessageIndex !== -1 &&
        lastUserMessageIndex >= messages.length - 2
      ) {
        const lastUserMessage = messages[lastUserMessageIndex];
        const textPart = lastUserMessage.parts.find((p) => p.type === 'text');

        if (textPart && typeof textPart.text === 'string') {
          // 恢复文本到输入框
          setText(textPart.text);
          // 移除失败的消息及其后续的部分响应
          setMessages(messages.slice(0, lastUserMessageIndex));
        }
      }
    } else if (!error) {
      // 错误清除时重置标志
      errorHandled.current = false;
      setShowError(false);
    }
  }, [error, messages, setMessages]);

  /**
   * 处理消息提交
   * - 验证消息内容（文本或附件）
   * - 发送消息到 AI
   * - 清空输入框
   */
  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      if (!hasText && !hasAttachments) {
        return;
      }

      if (message.files?.length) {
        toast.success('Files attached', {
          description: `${message.files.length} file(s) attached to message`,
        });
      }

      sendMessage(
        { text: message.text || 'Sent with attachments' },
        { body: { model } },
      );
      setText('');
    },
    [sendMessage, model],
  );

  // ==================== 渲染 ====================

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      {/* 会话切换器 */}
      <div className="flex items-center justify-between border-b p-2">
        <Select value={currentSessionId} onValueChange={handleSessionChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select chat" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={handleCreateSession}>
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {/* 输入暂停提示（当聚焦输入框时显示） */}
      {isInputPause && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}

      {/* 对话区域 */}
      <Conversation>
        <ConversationContent>
          {/* 空状态提示 */}
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            /* 消息列表 */
            messages.map((message) => {
              // 分离消息部分：来源链接 vs 其他内容
              const [sources, others] = partition(
                message.parts,
                (part) => part.type === 'source-url',
              );

              return (
                <Fragment key={message.id}>
                  <Message from={message.role}>
                    <MessageContent>
                      {/* AI 回复的来源链接 */}
                      {message.role === 'assistant' && sources.length > 0 && (
                        <Sources>
                          <SourcesTrigger count={sources.length} />
                          {sources.map((part, i) => {
                            return (
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            );
                          })}
                        </Sources>
                      )}

                      {/* 渲染其他消息部分 */}
                      {others.map((part, i) => {
                        // 工具调用部分
                        if (isToolPart(part)) {
                          return (
                            <Tool key={part.toolCallId}>
                              <ToolHeader type={part.type} state={part.state} />
                              <ToolContent>
                                <ToolInput input={part.input} />
                                {part.state === 'output-error' && (
                                  <ToolOutput
                                    errorText={part.errorText}
                                    output={part.output}
                                  />
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }

                        // 根据消息部分类型渲染
                        switch (part.type) {
                          case 'text':
                            // 普通文本消息
                            return (
                              <MessageResponse key={`${message.id}-${i}`}>
                                {part.text}
                              </MessageResponse>
                            );
                          case 'reasoning':
                            // 推理过程（思维链）
                            if (part.text === '[REDACTED]') {
                              return null;
                            }
                            return (
                              <ChainOfThought
                                key={`${message.id}-${i}`}
                                className="mb-4"
                                defaultOpen={false}
                              >
                                <ChainOfThoughtHeader>
                                  Thinking Process
                                </ChainOfThoughtHeader>
                                <ChainOfThoughtContent>
                                  <div className="text-sm text-muted-foreground">
                                    <Streamdown>{part.text}</Streamdown>
                                  </div>
                                </ChainOfThoughtContent>
                              </ChainOfThought>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                </Fragment>
              );
            })
          )}
          {/* 加载状态指示器 */}
          {status === 'submitted' && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* 输入区域 */}
      <div className="grid shrink-0 gap-4 pt-4">
        {/* 输入框容器 */}
        <div className="w-full px-4 pb-4 relative">
          {/* 错误提示横幅 */}
          {showError && (
            <div className="absolute bottom-full left-4 right-4 mb-2 z-10">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-sm font-medium flex-1">
                  {error?.message || 'An error occurred'}. Draft restored.
                </span>
                <button
                  onClick={() => setShowError(false)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            {/* 输入文本区域 */}
            <PromptInputBody>
              <PromptInputTextarea
                aria-invalid={showError}
                onFocus={() => setInputPause(true)}
                onBlur={() => setInputPause(false)}
                onChange={(event) => setText(event.target.value)}
                value={text}
              />
            </PromptInputBody>

            {/* 底部工具栏 */}
            <PromptInputFooter>
              <PromptInputTools>
                {/* 模型选择器 */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="group flex items-center space-x-1.5 text-[10px]  font-bold text-foreground hover:text-accent-foreground hover:bg-accent px-2 py-1 rounded-md transition-all select-none outline-none cursor-pointer data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                    <selectedModelData.icon
                      size={12}
                      className={selectedModelData.color}
                    />
                    <span>{selectedModelData.name}</span>
                    <ChevronUp
                      size={10}
                      className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      side="top"
                      align="start"
                      sideOffset={8}
                      className="w-60 bg-popover border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-100"
                    >
                      <DropdownMenu.Label className="px-2 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Select Model
                      </DropdownMenu.Label>

                      <DropdownMenu.RadioGroup
                        value={model}
                        onValueChange={setModel}
                        className="flex flex-col gap-1"
                      >
                        {MODELS.map((item) => (
                          <DropdownMenu.RadioItem
                            key={item.id}
                            value={item.id}
                            className="relative flex w-full cursor-pointer select-none items-center gap-3 rounded-lg p-2 outline-none transition-colors data-[state=checked]:bg-accent hover:bg-accent"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted border border-border">
                              <item.icon size={16} className={item.color} />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {item.description}
                              </span>
                            </div>
                            <DropdownMenu.ItemIndicator>
                              <CheckIcon size={14} className="text-primary" />
                            </DropdownMenu.ItemIndicator>
                          </DropdownMenu.RadioItem>
                        ))}
                      </DropdownMenu.RadioGroup>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                {/* <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      {selectedModelData && (
                        <ModelSelectorName>
                          {selectedModelData}
                        </ModelSelectorName>
                      )}
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {models.map((m) => (
                        <ModelSelectorItem
                          key={m}
                          onSelect={() => {
                            setModel(m);
                            setModelSelectorOpen(false);
                          }}
                          value={m}
                        >
                          <ModelSelectorName>{m}</ModelSelectorName>
                          {model === m ? (
                            <CheckIcon className="ml-auto size-4" />
                          ) : (
                            <div className="ml-auto size-4" />
                          )}
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector> */}
              </PromptInputTools>

              {/* 提交按钮（流式响应时变为停止按钮） */}
              <PromptInputSubmit
                disabled={!text && !status}
                status={status}
                onClick={(e) => {
                  if (status === 'streaming') {
                    e.preventDefault();
                    stop();
                  }
                }}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};
