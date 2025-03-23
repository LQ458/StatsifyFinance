"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MessageOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DeleteOutlined,
  RobotOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import styles from "@/src/css/ai-chat.module.css";
import { useTranslations } from "next-intl";
import ScreenCaptureButton from "./ScreenCaptureButton";
import ScreenCapture from "./ScreenCapture";
import { useSession } from "next-auth/react";
import { Modal, message, Tooltip } from "antd";
import { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import SyntaxHighlighter from "react-syntax-highlighter";
import mathStyles from "@/src/css/math-formula.module.css";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

interface ChatError {
  message: string;
  code?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "image";
  imageUrl?: string;
  status?: "sending" | "error" | "success";
  error?: ChatError;
  _timestamp?: number;
}

interface SuggestedTopic {
  title: string;
  content?: string;
}

type ChatSize = "small" | "large" | "full";

// 本地存储键
const GUEST_MESSAGE_COUNT_KEY = "guestMessageCount";
const MAX_GUEST_MESSAGES = 3;

interface ChatHistory {
  conversationId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

// 加密key
const ENCRYPT_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "statsify-finance";

// 访客消息记录加密存储
const encryptData = (data: string) => {
  try {
    const timestamp = Date.now();
    const text = JSON.stringify({
      data,
      timestamp,
    });
    return btoa(text); // Base64编码
  } catch (e) {
    return "";
  }
};

const decryptData = (text: string) => {
  try {
    const decoded = atob(text); // Base64解码
    const { data, timestamp } = JSON.parse(decoded);
    // 检查时间戳是否在24小时内
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

// 获取初始消息
const getInitialMessage = (t: any): Message => ({
  id: "initial",
  role: "assistant" as const,
  content: t("aiChat.tips.welcome"),
  type: "text",
  status: "success",
});

// 扩展 Components 类型
interface ExtendedComponents extends Partial<Components> {
  math?: React.ComponentType<{
    node: any;
    inline: boolean;
    children: React.ReactNode;
  }>;
}

export default function AIChat() {
  const t = useTranslations("common");
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatSize") as ChatSize) || "small";
    }
    return "small";
  });
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 预设问题
  const suggestedQuestions = useMemo(
    () => [
      {
        title: t("aiChat.tips.example1").replace("• ", ""),
        content: t("aiChat.tips.example1").replace("• ", ""),
      },
      {
        title: t("aiChat.tips.example2").replace("• ", ""),
        content: t("aiChat.tips.example2").replace("• ", ""),
      },
      {
        title: t("aiChat.tips.example3").replace("• ", ""),
        content: t("aiChat.tips.example3").replace("• ", ""),
      },
    ],
    [t],
  );
  // 保存尺寸偏好
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatSize", chatSize);
    }
  }, [chatSize]);

  // 切换到指定尺寸
  const setSize = (size: ChatSize) => {
    setChatSize(size);
  };

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 获取推荐topics
  useEffect(() => {
    if (isOpen) {
      // 添加欢迎消息和预设问题
      if (messages.length === 0) {
        setMessages([getInitialMessage(t)]);
        setSuggestedTopics(suggestedQuestions);
      }
    }
  }, [isOpen, t, messages.length]);

  // 监听滚动事件
  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messageList;
      // 调整阈值为50px，更好地识别是否在底部
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

      if (!isUserScrolling) {
        setShouldAutoScroll(isNearBottom);
      }
      setShowScrollButton(!isNearBottom);
    };

    messageList.addEventListener("scroll", handleScroll);
    return () => messageList.removeEventListener("scroll", handleScroll);
  }, [isUserScrolling]);

  // 处理用户滚动
  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    const handleWheel = () => {
      // 检查是否向上滚动
      const { scrollTop, scrollHeight, clientHeight } = messageList;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

      // 仅当不在底部时才设置用户滚动状态
      if (!isNearBottom) {
        setIsUserScrolling(true);
        setShouldAutoScroll(false);
      }

      // 重置用户滚动状态的计时器
      const timer = setTimeout(() => {
        // 重新检查是否在底部
        if (messageList) {
          const { scrollTop, scrollHeight, clientHeight } = messageList;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
          // 仅当在底部时重置滚动状态
          if (isAtBottom) {
            setIsUserScrolling(false);
            setShouldAutoScroll(true);
          }
        }
      }, 200); // 调整为200ms

      return () => clearTimeout(timer);
    };

    // 添加触摸事件监听，对于移动设备
    const handleTouchMove = () => {
      handleWheel();
    };

    messageList.addEventListener("wheel", handleWheel);
    messageList.addEventListener("touchmove", handleTouchMove);
    messageList.addEventListener("scroll", handleWheel, { passive: true });

    return () => {
      messageList.removeEventListener("wheel", handleWheel);
      messageList.removeEventListener("touchmove", handleTouchMove);
      messageList.removeEventListener("scroll", handleWheel);
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (shouldAutoScroll && messageListRef.current) {
      const smoothScroll = () => {
        if (messageListRef.current) {
          messageListRef.current.scrollTo({
            top: messageListRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      };

      // 延迟一点执行滚动，确保DOM已更新
      const timer = setTimeout(smoothScroll, 10);
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll]);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShouldAutoScroll(true);
      setShowScrollButton(false);
      setIsUserScrolling(false);
    }
  };

  const generateTopics = async () => {
    try {
      const response = await fetch("/api/suggest-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageType: window.location.pathname.includes("quantitative")
            ? "quantitative"
            : "qualitative",
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setSuggestedTopics(data.data);
      } else {
        setSuggestedTopics([]);
      }
    } catch (error) {
      console.error("Failed to get topics:", error);
      setSuggestedTopics([]);
      setError(t("error.topics"));
    }
  };

  const handleTopicClick = (topic: SuggestedTopic) => {
    setInputValue(topic.title);
    handleSendMessage(topic.title);
  };

  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      const response = await fetch("/api/chat");
      if (!response.ok) throw new Error("获取历史记录失败");

      const { data } = await response.json();
      setChatHistories(data);
    } catch (error) {
      console.error("获取历史记录失败:", error);
      message.error("获取历史记录失败");
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // 更新访客消息计数
  const updateGuestMessageCount = () => {
    if (!session?.user) {
      try {
        // 从localStorage获取当前计数
        const encrypted = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
        let count = 0;

        if (encrypted) {
          const decrypted = decryptData(encrypted);
          if (decrypted !== null) {
            count = parseInt(decrypted);
          }
        }

        // 增加计数并重新加密存储
        count += 1;
        localStorage.setItem(
          GUEST_MESSAGE_COUNT_KEY,
          encryptData(count.toString()),
        );

        // 如果达到最大次数，显示提示
        if (count >= MAX_GUEST_MESSAGES) {
          message.warning("您已用完免费聊天次数，请登录以继续使用");
        }
      } catch (e) {
        console.error("更新访客消息计数错误:", e);
        // 出错时仍设置一个计数，防止绕过限制
        localStorage.setItem(GUEST_MESSAGE_COUNT_KEY, encryptData("1"));
      }
    }
  };

  // 检查访客消息限制
  const checkGuestMessageLimit = () => {
    if (session?.user) return true;

    try {
      const encrypted = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
      if (!encrypted) return true;

      const decrypted = decryptData(encrypted);
      if (decrypted === null) return true;

      const count = parseInt(decrypted);

      if (count >= MAX_GUEST_MESSAGES) {
        setShowLoginModal(true);
        message.warning("您已用完免费聊天次数，请登录以继续使用");
        return false;
      }
      return true;
    } catch (e) {
      console.error("检查访客消息限制错误:", e);
      // 发生错误时返回true，允许用户继续
      return true;
    }
  };

  // 处理发送消息
  const handleSendMessage = useCallback(
    async (message?: string) => {
      const textToSend = message || inputValue.trim();
      if (!textToSend) {
        setError(t("error.empty"));
        return;
      }

      if (textToSend.length > 1000) {
        setError(t("error.tooLong"));
        return;
      }

      // 检查访客消息限制
      if (!session?.user && !checkGuestMessageLimit()) {
        return;
      }

      setLoading(true);
      setError(null);
      setInputValue("");

      // 使用更精确的时间戳
      const userMessageId = `user_${Date.now()}`;
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: textToSend,
      };
      // 添加用户消息
      setMessages((prev) => [...prev, userMessage]);

      try {
        // AI消息ID使用不同的时间戳
        const aiMessageId = `assistant_${Date.now()}`;
        // 添加AI空消息
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            role: "assistant",
            content: "",
            status: "sending",
            _timestamp: Date.now(),
          },
        ]);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: textToSend,
            locale: window.location.pathname.startsWith("/en") ? "en" : "zh",
            conversationId: currentConversationId || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 如果这是一个新对话，从响应头获取conversationId
        if (!currentConversationId) {
          const newConversationId = response.headers.get("X-Conversation-Id");
          if (newConversationId) {
            setCurrentConversationId(newConversationId);
          }
        }

        // 检查是否为访客用户
        const isGuest = response.headers.get("X-Guest-User") === "true";
        if (isGuest) {
          // 增加访客消息计数
          updateGuestMessageCount();
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let accumulatedContent = "";
        let timer = null;
        let isBlockLaTeX = false;
        let isInlineLateX = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const chunks = text.split("\n").filter(Boolean);

          for (const chunk of chunks) {
            try {
              // 处理特殊格式的chunk (0:"文本")
              if (chunk.startsWith("0:")) {
                // 提取引号中的文本内容
                const content = chunk.substring(2).trim();
                if (content.startsWith('"') && content.endsWith('"')) {
                  const extractedText = content
                    .slice(1, -1)
                    .replace(/\\"/g, '"') // 处理转义的引号
                    .replace(/\\n/g, "\n") // 处理换行符
                    // .replace(/%/g, '\\%') // 在LaTeX中%为注释符，写在%后面的内容会被注释，在这里加上转义\变为\%就能正常输出了 --20250321注掉,在后面公式代码标记替换中有对\\转\的处理,让公式格式在对话时解析正常,里面有%号的地方也已经能正确识别
                    .replace(/\$/g, "\\$");

                  accumulatedContent += extractedText;

                  if (!timer) {
                    timer = setTimeout(() => {
                      // 只更新AI消息的内容
                      setMessages((prevMessages) => {
                        // 使用role和id双重检查确保更新正确的消息
                        const aiMessageIndex = prevMessages.findIndex(
                          (msg) =>
                            msg.id === aiMessageId && msg.role === "assistant",
                        );
                        if (aiMessageIndex === -1) return prevMessages;

                        const newMessages = [...prevMessages];
                        newMessages[aiMessageIndex] = {
                          ...newMessages[aiMessageIndex],
                          content: accumulatedContent,
                          status: "success",
                        };
                        return newMessages;
                      });
                      timer = null;
                    }, 300);
                  }
                  continue;
                }
              }

              // 尝试标准JSON解析
              try {
                const { content } = JSON.parse(chunk);
                if (typeof content === "string") {
                  accumulatedContent += content;
                  // 只更新AI消息的内容
                  setMessages((prevMessages) => {
                    const aiMessageIndex = prevMessages.findIndex(
                      (msg) =>
                        msg.id === aiMessageId && msg.role === "assistant",
                    );
                    if (aiMessageIndex === -1) return prevMessages;

                    const newMessages = [...prevMessages];
                    newMessages[aiMessageIndex] = {
                      ...newMessages[aiMessageIndex],
                      content: accumulatedContent,
                      status: "success",
                    };
                    return newMessages;
                  });
                }
              } catch (jsonError) {
                console.debug("Non-JSON chunk received:", chunk);
              }
            } catch (e) {
              console.debug("Error processing chunk:", chunk, e);
            }
          }
        }

        // 完成后获取更新的聊天历史
        if (session?.user || !session?.user) {
          fetchChatHistory();
        }
      } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            setError(t("error.network"));
          } else if (error.message.includes("HTTP error")) {
            setError(t("error.server"));
          } else if (error.message.includes("No response body")) {
            setError(t("error.empty_response"));
          } else {
            setError(t("error.failed"));
          }
        } else {
          setError(t("error.unknown"));
        }
      } finally {
        setLoading(false);
      }
    },
    [
      inputValue,
      t,
      session,
      currentConversationId,
      checkGuestMessageLimit,
      updateGuestMessageCount,
      fetchChatHistory,
    ],
  );

  // 处理图片分析，类似地优化实时渲染
  const handleImageAnalysis = useCallback(
    async (imageData: string, question: string) => {
      setLoading(true);
      setError(null);

      try {
        const imageMessageId = `user_${Date.now()}`;
        const imageMessage: Message = {
          id: imageMessageId,
          role: "user",
          content: question,
          type: "image",
          imageUrl: imageData,
          status: "sending",
        };

        // 添加用户消息
        setMessages((prev) => [...prev, imageMessage]);

        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageData,
            question: question,
            locale: window.location.pathname.startsWith("/en") ? "en" : "zh",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const aiMessageId = `assistant_${Date.now()}`;

        // 添加AI空消息
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            role: "assistant",
            content: "",
            type: "text",
            status: "sending",
            _timestamp: Date.now(),
          },
        ]);

        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const chunks = text.split("\n").filter(Boolean);

          for (const chunk of chunks) {
            try {
              // 处理结束标记
              if (chunk === "d:[DONE]") {
                console.log("[Chat Frontend] Image analysis complete");
                continue;
              }

              // 处理内容
              if (chunk.startsWith("0:")) {
                const content = chunk.slice(2);
                console.log(
                  "[Chat Frontend] Processing image analysis content:",
                  content,
                );

                if (content) {
                  accumulatedContent += content;
                  // 只更新AI消息的内容
                  setMessages((prevMessages) => {
                    const aiMessageIndex = prevMessages.findIndex(
                      (msg) =>
                        msg.id === aiMessageId && msg.role === "assistant",
                    );
                    if (aiMessageIndex === -1) return prevMessages;

                    const newMessages = [...prevMessages];
                    newMessages[aiMessageIndex] = {
                      ...newMessages[aiMessageIndex],
                      content: accumulatedContent,
                      status: "success",
                    };
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              console.error("Error processing image analysis chunk:", chunk, e);
            }
          }
        }
      } catch (error) {
        console.error("Error analyzing image:", error);
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            setError(t("error.network"));
          } else if (error.message.includes("HTTP error")) {
            setError(t("error.server"));
          } else if (error.message.includes("No response body")) {
            setError(t("error.empty_response"));
          } else {
            setError(t("error.failed"));
          }
        } else {
          setError(t("error.unknown"));
        }
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // 重试发送消息
  const handleRetry = useCallback(
    (message: Message) => {
      // 移除错误消息
      setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
      // 重新发送
      handleSendMessage(message.content);
    },
    [handleSendMessage],
  ); // 添加handleSendMessage到依赖数组

  // 添加MathComponent
  const MathComponent: React.FC<{
    node: any;
    inline: boolean;
    children: React.ReactNode;
  }> = ({ node, inline, children }) => {
    const [copied, setCopied] = useState(false);
    const mathRef = useRef<HTMLDivElement>(null);

    const handleCopy = () => {
      if (mathRef.current) {
        const text = mathRef.current.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    };

    return inline ? (
      <span className={mathStyles.inlineMath}>{children}</span>
    ) : (
      <div className={mathStyles.mathContainer}>
        <div className={mathStyles.displayMath}>
          <div ref={mathRef} className={mathStyles.mathContent}>
            {children}
          </div>
          <button
            className={mathStyles.copyButton}
            onClick={handleCopy}
            aria-label="Copy formula"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
    );
  };

  // 渲染消息
  const renderMessage = useCallback(
    (message: Message, index: number) => {
      const replaceLatexSymbols = (inputStr: string) => {
        inputStr = inputStr
          .replace(/\\\\\[|\\\[/g, "\n$$$$\n")
          .replace(/\\\\\]|\\\]/g, "\n$$$$\n");
        inputStr = inputStr
          .replace(/\\\\\(|\\\(/g, "$")
          .replace(/\\\\\)|\\\)/g, "$");
        inputStr = inputStr.replace(/\\{2}/g, "\\");
        return inputStr;
      };
      let content = replaceLatexSymbols(message.content);
      // console.log('content::',  content )
      return (
        <div
          key={`${message.id}-${index}-${message._timestamp || 0}`}
          className={`${styles.message} ${
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          }`}
        >
          {message.type === "image" && message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Captured screenshot"
              className={styles.messageImage}
            />
          )}
          <ReactMarkdown
            key={`md-${message.id}-${index}`}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={
              {
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow as SyntaxHighlighterProps["style"]}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ node, children, ...props }) => {
                  if (
                    children &&
                    Array.isArray(children) &&
                    children.length > 0
                  ) {
                    return (
                      <p className={styles.markdownParagraph} {...props}>
                        {children}
                      </p>
                    );
                  }
                  if (typeof children === "string" && children.trim()) {
                    return (
                      <p className={styles.markdownParagraph} {...props}>
                        {children}
                      </p>
                    );
                  }
                  return null;
                },
                math: MathComponent,
              } as ExtendedComponents
            }
          >
            {content || " "}
          </ReactMarkdown>
          {message.status === "error" && message.error && (
            <div className={styles.messageError}>
              <span>{message.error.message}</span>
              <button
                onClick={() => handleRetry(message)}
                className={styles.retryButton}
              >
                重试
              </button>
            </div>
          )}
        </div>
      );
    },
    [shouldAutoScroll, handleRetry],
  );

  // 切换历史记录显示
  const toggleHistory = useCallback(() => {
    setIsHistoryVisible(!isHistoryVisible);
  }, [isHistoryVisible]);

  // 根据窗口大小自动调整历史记录显示
  useEffect(() => {
    if (chatSize === "full") {
      setIsHistoryVisible(false);
    } else if (chatSize === "small") {
      setIsHistoryVisible(false);
    }
  }, [chatSize]);

  // 新对话
  const startNewChat = useCallback(() => {
    setMessages([getInitialMessage(t)]);
    setCurrentConversationId(null);
    setSuggestedTopics(suggestedQuestions);
    if (chatSize === "small") {
      setIsHistoryVisible(false);
    }
  }, [t, chatSize]);

  // 获取当前聊天标题
  const getCurrentChatTitle = useCallback(() => {
    if (!currentConversationId) return t("aiChat.title");

    const currentChat = chatHistories.find(
      (chat) => chat.conversationId === currentConversationId,
    );

    return currentChat?.title || t("aiChat.title");
  }, [currentConversationId, chatHistories, t]);

  // 定义ChatHistory组件
  const ChatHistory = () => {
    if (!session?.user) return null;

    return (
      <div
        className={`${styles.historyDrawer} ${isHistoryVisible ? styles.visible : ""}`}
      >
        <div className={styles.historyHeader}>
          <h3>{t("aiChat.chatHistory")}</h3>
          <button className={styles.newChatButton} onClick={startNewChat}>
            {t("aiChat.newChat")}
          </button>
        </div>
        <div className={styles.historyList}>
          {chatHistories.map((chat) => (
            <div
              key={chat.conversationId}
              className={`${styles.historyItem} ${
                currentConversationId === chat.conversationId
                  ? styles.active
                  : ""
              }`}
              onClick={() => {
                loadConversation(chat.conversationId);
                if (chatSize === "small") {
                  setIsHistoryVisible(false);
                }
              }}
            >
              <div className={styles.historyItemContent}>
                <div className={styles.historyTitle}>
                  {chat.title || "新对话"}
                </div>
                <div className={styles.historyDate}>
                  {new Date(chat.updatedAt).toLocaleString()}
                </div>
              </div>
              <Tooltip title="删除对话" zIndex={11100}>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(chat.conversationId);
                  }}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 删除对话
  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat?conversationId=${conversationId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("删除失败");

      // 更新历史记录列表
      setChatHistories(
        chatHistories.filter((chat) => chat.conversationId !== conversationId),
      );

      // 如果删除的是当前对话,清空消息
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }

      message.success("删除成功");
    } catch (error) {
      console.error("删除对话失败:", error);
      message.error("删除失败");
    }
  };

  // 加载特定对话
  const loadConversation = async (conversationId: string) => {
    setLoading(true);
    setError(null);

    try {
      // 获取特定对话详情
      const response = await fetch(
        `/api/chat?conversationId=${conversationId}`,
      );
      if (!response.ok) throw new Error("加载对话失败");

      const { data } = await response.json();

      if (data && data.length > 0) {
        const chat = data[0];

        // 确保消息数组按时间戳排序
        const sortedMessages = Array.isArray(chat.messages)
          ? [...chat.messages].sort((a, b) => {
              return (
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
              );
            })
          : [];

        // 将后端消息格式转换为前端格式
        const formattedMessages: Message[] = sortedMessages.map(
          (msg: any, index: number) => ({
            id: `${msg.role}_${new Date(msg.timestamp).getTime() || index}`,
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content || "",
            status: "success",
          }),
        );

        // 清除输入框并更新状态
        setInputValue("");
        setMessages(formattedMessages);
        setCurrentConversationId(chat.conversationId);
        setIsHistoryVisible(false);
      } else {
        setError(t("error.conversation_not_found"));
      }
    } catch (error) {
      console.error("加载对话失败:", error);
      setError(t("error.load_conversation"));
    } finally {
      setLoading(false);
    }
  };

  // 复制消息内容
  const copyMessageContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    message.success({
      content: t("common.copy.success"),
      icon: <CheckOutlined style={{ color: "#52c41a" }} />,
    });

    // 设置当前复制的消息ID
    setCopiedMessageId(messageId);

    // 2秒后重置
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  return (
    <>
      <button
        className={styles.chatButton}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <MessageOutlined />
      </button>

      {isOpen && (
        <div
          className={`${styles.chatWindow} ${styles[`size-${chatSize}`]}`}
          ref={chatRef}
        >
          <div className={styles.chatHeader}>
            {session?.user && (
              <Tooltip
                title={isHistoryVisible ? "隐藏历史" : "显示历史"}
                zIndex={11100}
              >
                <button
                  className={styles.historyToggle}
                  onClick={toggleHistory}
                  aria-label={
                    isHistoryVisible ? "Hide history" : "Show history"
                  }
                >
                  {isHistoryVisible ? (
                    <MenuFoldOutlined />
                  ) : (
                    <MenuUnfoldOutlined />
                  )}
                </button>
              </Tooltip>
            )}
            <span className={styles.chatTitle}>
              <RobotOutlined />{" "}
              {chatSize === "small" ? "" : getCurrentChatTitle()}
            </span>
            <div className={styles.headerControls}>
              <ScreenCaptureButton
                onStartScreenshot={() => setIsScreenshotting(true)}
              />
              <div className={styles.sizeButtons}>
                <Tooltip title={t("size.small")} zIndex={11100}>
                  <button
                    className={`${styles.sizeButton} ${chatSize === "small" ? styles.active : ""}`}
                    onClick={() => setSize("small")}
                    aria-label="Small size"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="10" width="12" height="8" rx="2"></rect>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip title={t("size.large")} zIndex={11100}>
                  <button
                    className={`${styles.sizeButton} ${chatSize === "large" ? styles.active : ""}`}
                    onClick={() => setSize("large")}
                    aria-label="Large size"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip title={t("size.full")} zIndex={11100}>
                  <button
                    className={`${styles.sizeButton} ${chatSize === "full" ? styles.active : ""}`}
                    onClick={() => setSize("full")}
                    aria-label="Full size"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className={styles.chatContainer}>
            <ChatHistory />

            <div className={styles.messageList} ref={messageListRef}>
              {messages.length === 1 && messages[0].role === "assistant" && (
                <div className={styles.topicsList}>
                  <div className={styles.topicsHeader}>
                    {t("suggestedTopics")}
                  </div>
                  {suggestedTopics.map((topic, index) => (
                    <div
                      key={`topic-${index}`}
                      className={styles.topicItem}
                      onClick={() => handleTopicClick(topic)}
                    >
                      {topic.title}
                    </div>
                  ))}
                </div>
              )}

              {messages.map((message, index) => renderMessage(message, index))}
              {loading && <div className={styles.loading}>{t("thinking")}</div>}
              {error && <div className={styles.error}>{error}</div>}
            </div>

            {showScrollButton && (
              <button
                className={`${styles.scrollButton} ${!showScrollButton ? styles.hidden : ""}`}
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
              >
                <DownOutlined />
              </button>
            )}

            <div className={styles.inputArea}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleSendMessage()
                }
                placeholder={t("placeholder")}
                className={styles.input}
                disabled={loading}
              />
              <button
                onClick={() => handleSendMessage()}
                className={styles.sendButton}
                disabled={loading}
              >
                {t("send")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="登录提醒"
        open={showLoginModal}
        onOk={() => {
          // 跳转到登录页面
          window.location.href = "/login";
        }}
        onCancel={() => setShowLoginModal(false)}
        okText="去登录"
        cancelText="取消"
      >
        <p>
          您已达到游客模式的对话次数限制(3次)。登录后可以无限对话并保存聊天记录。
        </p>
      </Modal>

      <ScreenCapture
        onCapture={handleImageAnalysis}
        onScreenshotEnd={() => setIsScreenshotting(false)}
        isSelecting={isScreenshotting}
        onQuestionSelected={() => setIsOpen(true)}
      />
    </>
  );
}
