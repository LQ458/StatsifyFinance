"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DeleteOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import styles from "@/src/css/ai-chat.module.css";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { useTranslations } from "next-intl";
import ScreenCaptureButton from "./ScreenCaptureButton";
import ScreenCapture from "./ScreenCapture";
import mathStyles from "@/src/css/math-formula.module.css";
import { useSession } from "next-auth/react";
import { Modal, message, Tooltip } from "antd";
import { Components } from "react-markdown";

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

// 预设问题
const suggestedQuestions = [
  {
    title: "什么是量化交易？",
    content: "请解释量化交易的概念、优势和主要策略。",
  },
  {
    title: "如何分析股票基本面？",
    content: "请介绍分析股票基本面的主要方法和关键指标。",
  },
  {
    title: "风险管理的基本原则是什么？",
    content: "请说明金融投资中风险管理的基本原则和具体方法。",
  },
];

// 获取初始消息
const getInitialMessage = (t: any): Message => ({
  id: "initial",
  role: "assistant" as const,
  content: t("tips.welcome"),
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
  const t = useTranslations("common.aiChat");
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

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
      setIsUserScrolling(true);
      setShouldAutoScroll(false);

      // 重置用户滚动状态的计时器
      const timer = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150); // 150ms 后重置

      return () => clearTimeout(timer);
    };

    messageList.addEventListener("wheel", handleWheel);
    messageList.addEventListener("touchmove", handleWheel);

    return () => {
      messageList.removeEventListener("wheel", handleWheel);
      messageList.removeEventListener("touchmove", handleWheel);
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (shouldAutoScroll && messageListRef.current && !isUserScrolling) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll, isUserScrolling]);

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
    if (!session?.user) return;

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
    if (session?.user) {
      fetchChatHistory();
    }
  }, [session]);

  // 更新访客消息计数
  const updateGuestMessageCount = () => {
    if (!session?.user) {
      const count = parseInt(
        localStorage.getItem(GUEST_MESSAGE_COUNT_KEY) || "0",
      );
      localStorage.setItem(
        GUEST_MESSAGE_COUNT_KEY,
        encryptData((count + 1).toString()),
      );
    }
  };

  // 检查访客消息限制
  const checkGuestMessageLimit = () => {
    if (session?.user) return true;

    const encrypted = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
    if (!encrypted) return true;

    const count = parseInt(decryptData(encrypted) || "0");
    if (count >= MAX_GUEST_MESSAGES) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputValue.trim();
    if (!textToSend) {
      setError(t("error.empty"));
      return;
    }

    if (textToSend.length > 1000) {
      setError(t("error.tooLong"));
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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      // 确保AI消息ID与用户消息ID不会冲突
      const aiMessageId = `assistant_${Date.now()}`;
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
      };
      setMessages([...newMessages, aiMessage]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
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

      let accumulatedContent = "";

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
                  .replace(/\\n/g, "\n"); // 处理换行符

                accumulatedContent += extractedText;
                // 只更新AI消息的内容
                setMessages((prevMessages) => {
                  // 使用role和id双重检查确保更新正确的消息
                  const aiMessageIndex = prevMessages.findIndex(
                    (msg) => msg.id === aiMessageId && msg.role === "assistant",
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
                    (msg) => msg.id === aiMessageId && msg.role === "assistant",
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
  };

  const handleScreenshotStart = useCallback(() => {
    setIsScreenshotting(true);
  }, []);

  const handleScreenshotEnd = useCallback(() => {
    setIsScreenshotting(false);
  }, []);

  const handleShowChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleImageAnalysis = async (imageData: string, question: string) => {
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
      const newMessages = [...messages, imageMessage];
      setMessages(newMessages);

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
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        type: "text",
        status: "sending",
      };
      setMessages([...newMessages, aiMessage]);

      let accumulatedContent = "";
      console.log("[Chat Frontend] Starting to read image analysis stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[Chat Frontend] Image analysis stream complete");
          break;
        }

        const text = decoder.decode(value);
        console.log("[Chat Frontend] Received image analysis chunk:", text);
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
                    (msg) => msg.id === aiMessageId && msg.role === "assistant",
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
            console.error(
              "[Chat Frontend] Error processing image analysis chunk:",
              chunk,
              e,
            );
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
  };

  // 加载特定对话
  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat?conversationId=${conversationId}`,
      );
      if (!response.ok) throw new Error("加载对话失败");

      const { data } = await response.json();
      if (data && data[0]) {
        // 确保所有消息都有必需的字段
        const validatedMessages = data[0].messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content || "",
          type: msg.type || "text",
          status: msg.status || "success",
          ...(msg.imageUrl && { imageUrl: msg.imageUrl }),
          ...(msg.error && { error: msg.error }),
        }));

        // 如果只有一条欢迎消息,显示预设问题
        if (
          validatedMessages.length === 1 &&
          validatedMessages[0].role === "assistant"
        ) {
          setSuggestedTopics(suggestedQuestions);
        } else {
          setSuggestedTopics([]);
        }
        setMessages(validatedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error("加载对话失败:", error);
      message.error("加载对话失败");
    }
  };

  // 切换历史记录显示
  const toggleHistory = useCallback(() => {
    setIsHistoryVisible(!isHistoryVisible);
  }, [isHistoryVisible]);

  // 根据窗口大小自动调整历史记录显示
  useEffect(() => {
    if (chatSize === "full") {
      setIsHistoryVisible(true);
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

  // 修改ChatHistory组件
  const ChatHistory = () => {
    if (!session?.user) return null;

    return (
      <div
        className={`${styles.historyDrawer} ${isHistoryVisible ? styles.visible : ""}`}
      >
        <div className={styles.historyHeader}>
          <h3>聊天记录</h3>
          <button className={styles.newChatButton} onClick={startNewChat}>
            新对话
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
              <Tooltip title="删除对话">
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
  const renderMessage = (message: Message, index: number) => {
    return (
      <div
        key={`${message.id}-${index}`}
        className={`${styles.message} ${
          message.role === "user" ? styles.userMessage : styles.assistantMessage
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
          {message.content || " "}
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
  };

  // 重试发送消息
  const handleRetry = (message: Message) => {
    // 移除错误消息
    setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    // 重新发送
    handleSendMessage(message.content);
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
              <Tooltip title={isHistoryVisible ? "隐藏历史" : "显示历史"}>
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
              <RobotOutlined /> {chatSize === "small" ? "" : t("title")}
            </span>
            <div className={styles.headerControls}>
              <ScreenCaptureButton onStartScreenshot={handleScreenshotStart} />
              <div className={styles.sizeButtons}>
                <button
                  className={`${styles.sizeButton} ${chatSize === "small" ? styles.active : ""}`}
                  onClick={() => setSize("small")}
                  aria-label="Small size"
                >
                  ⬇️
                </button>
                <button
                  className={`${styles.sizeButton} ${chatSize === "large" ? styles.active : ""}`}
                  onClick={() => setSize("large")}
                  aria-label="Large size"
                >
                  ⬆️
                </button>
                <button
                  className={`${styles.sizeButton} ${chatSize === "full" ? styles.active : ""}`}
                  onClick={() => setSize("full")}
                  aria-label="Full size"
                >
                  ↕️
                </button>
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
        onScreenshotEnd={handleScreenshotEnd}
        isSelecting={isScreenshotting}
        onQuestionSelected={handleShowChat}
      />
    </>
  );
}
