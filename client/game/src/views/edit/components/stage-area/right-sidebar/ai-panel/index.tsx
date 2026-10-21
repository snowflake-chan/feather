import { InputPauseFlags } from '@box/schema/input/input-schema';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEdit } from 'src/client/edit/edit-context';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import style from './index.module.scss';
import mdStyle from './markdown.module.scss';

export interface AiPanelProps {
  hide: boolean;
}
export function AiPanel(props: AiPanelProps) {
  const editClient = useEdit();
  const isReady = editClient.codeEditorController.monacoController.isReady;
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { inputPauseChange } = useInputPause();

  // 发送消息到AI并处理响应
  const sendMessage = useCallback(
    async (userMessage: AiMessage) => {
      // 定义消息处理器回调函数
      const messageHandler = (messageList: ReadonlyArray<AiMessage>) => {
        // 更新UI中的消息列表
        setMessages([...messageList]);
      };

      // 使用AI控制器发送消息
      return editClient.ai.sendChat({
        type: userMessage.type,
        content: userMessage.content,
        userMessage: userMessage,
        messageHandler,
      });
    },
    [editClient],
  );

  // 按下 Enter 键发送消息
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!inputText.trim() || isProcessing) return;

        const userInput = inputText.trim();
        setInputText('');

        // 创建用户消息
        const userMessage: AiMessage = {
          role: 'user',
          content: userInput,
        };

        setIsProcessing((prev) => prev + 1);

        setIsFocused(false);
        // 发送消息到AI
        await sendMessage(userMessage);
        setIsProcessing((prev) => prev - 1);
      }
    },
    [inputText, isProcessing, sendMessage],
  );

  // 在消息更新时，滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      // 获取最后一条消息的元素
      const lastMessage = chatContainerRef.current.lastElementChild;
      if (lastMessage) {
        // 平滑滚动到视图
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [isProcessing]);

  // 向 AI 发送选中的代码
  const sendCodeToAI = useCallback(
    async (type: CodeActionType) => {
      const selectedCode =
        editClient.codeEditorController.monacoController.getSelectionValue();
      if (!selectedCode) {
        return;
      }

      if (isProcessing) {
        editClient.ai.stopCurrentChat();
      }

      setIsProcessing((prev) => prev + 1);
      // 创建用户消息
      const userMessage: AiMessage = {
        role: 'user',
        content: `\`\`\`js\n${selectedCode}\`\`\``,
        type,
      };

      // 直接发送消息
      await sendMessage(userMessage);
      setIsProcessing((prev) => prev - 1);
    },
    [editClient, sendMessage, isProcessing],
  );

  // 初始化编辑器动作
  useEffect(() => {
    if (!isReady) {
      return;
    }

    setMessages(editClient.ai.currentMessages);

    // 添加编辑器动作
    const editorActions = [
      {
        id: 'ChatAiCodeDebug',
        label: '代码纠错',
        contextMenuGroupId: 'chatAi',
        contextMenuOrder: 1,
        run: () => sendCodeToAI('code:debug'),
      },
      {
        id: 'ChatAiCodeRefactor',
        label: '代码重构',
        contextMenuGroupId: 'chatAi',
        contextMenuOrder: 1.5,
        run: () => sendCodeToAI('code:refactor'),
      },
      {
        id: 'ChatAiCodeExplain',
        label: '代码解释',
        contextMenuGroupId: 'chatAi',
        contextMenuOrder: 2,
        run: () => sendCodeToAI('code:explain'),
      },
      {
        id: 'ChatAiCodeComment',
        label: '代码注释',
        contextMenuGroupId: 'chatAi',
        contextMenuOrder: 3,
        run: () => sendCodeToAI('code:comment'),
      },
      {
        id: 'ChatAiCodeOpti',
        label: '代码优化',
        contextMenuGroupId: 'chatAi',
        contextMenuOrder: 6,
        run: () => sendCodeToAI('code:opti'),
      },
    ];

    // 注册动作到编辑器
    const handlers = editorActions.map((action) => {
      return editClient.codeEditorController.monacoController.addActions(
        action,
      );
    });

    return () => {
      for (let i = 0; i < handlers.length; ++i) {
        handlers[i].dispose();
      }
    };
  }, [sendCodeToAI, editClient, isReady]);

  const classNames = useMemo(() => {
    let result = style.aiPanelContainer;
    if (props.hide) {
      result += ` ${style.hide}`;
    }
    return result;
  }, [props.hide]);

  const mdComponents: Partial<
    Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
  > = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <div className={style.codeBlock}>
            <button
              className={style.insertCodeButton}
              onClick={(ev) => {
                if (children.length > 0) {
                  editClient.codeEditorController.monacoController.insertCodeToSelection(
                    children[0] as string,
                  );
                }
              }}
            >
              插入代码
            </button>
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, '')}
              style={coldarkDark}
              language={match[1]}
              PreTag="div"
            />
          </div>
        ) : (
          <code {...props} className={className}>
            {children}
          </code>
        );
      },
    }),
    [editClient],
  );

  return (
    <div className={classNames}>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      <div className={style.chatContainer} ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === 'user'
                ? style.questionContainer
                : style.responseContainer
            }
          >
            <ReactMarkdown
              className={mdStyle['markdown-body']}
              children={message.content}
              components={mdComponents}
            />
          </div>
        ))}
      </div>

      <div className={style.inputArea}>
        <textarea
          className={style.textInput}
          placeholder="请输入您的问题，按Enter发送"
          // TODO: 使用国际化
          // placeholder={intl.formatMessage({
          //   id: 'ai.inputPlaceholder',
          //   defaultMessage: '请输入您的问题，按Enter发送',
          // })}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          disabled={isProcessing > 0}
          rows={3}
        />

        <button
          className={style.stopButton}
          onClick={() => {
            if (isProcessing) {
              editClient.ai.stopCurrentChat();
              setIsProcessing(0);
            } else {
              // 添加用户消息并发送
              const userInput = inputText.trim();
              if (!userInput) return;

              setInputText('');

              // 创建用户消息
              const userMessage: AiMessage = {
                role: 'user',
                content: userInput,
              };

              // 直接发送消息
              sendMessage(userMessage);
            }
          }}
        >
          {isProcessing ? '停止' : '发送'}
        </button>
      </div>
    </div>
  );
}
