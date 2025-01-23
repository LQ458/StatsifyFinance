"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageOutlined, DownOutlined } from "@ant-design/icons";
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

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "image";
  imageUrl?: string;
}

interface SuggestedTopic {
  title: string;
  content?: string;
}

type ChatSize = "small" | "large" | "full";

export default function AIChat() {
  const t = useTranslations("common.aiChat");
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
      generateTopics();
      // 添加欢迎消息
      if (messages.length === 0) {
        const welcomeMessage = `${t("tips.welcome")}

${t("tips.examples")}
${t("tips.example1")}
${t("tips.example2")}
${t("tips.example3")}`;

        setMessages([
          {
            role: "assistant",
            content: welcomeMessage,
          },
        ]);
      }
    }
  }, [isOpen, t]);

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

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const aiMessageId = Date.now().toString();
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
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg,
                  ),
                );
                continue;
              }
            }

            // 尝试标准JSON解析
            try {
              const { content } = JSON.parse(chunk);
              if (typeof content === "string") {
                accumulatedContent += content;
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg,
                  ),
                );
              }
            } catch (jsonError) {
              // JSON解析失败，但不抛出错误
              console.debug("Non-JSON chunk received:", chunk);
            }
          } catch (e) {
            // 记录错误但继续处理
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
      const userMessage: Message = {
        role: "user",
        content: question,
        type: "image",
        imageUrl: imageData,
      };
      const newMessages = [...messages, userMessage];
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

      const aiMessageId = Date.now().toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        type: "text",
      };
      setMessages([...newMessages, aiMessage]);

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const chunks = text.split("\n").filter(Boolean);

        for (const chunk of chunks) {
          try {
            // 处理结束标记
            if (chunk === "e:[DONE]" || chunk === "d:[DONE]") {
              continue;
            }

            // 处理特殊格式的chunk (0:"文本")
            if (chunk.startsWith("0:")) {
              const content = chunk.substring(2).trim();
              if (content.startsWith('"') && content.endsWith('"')) {
                const extractedText = content
                  .slice(1, -1)
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, "\n");

                accumulatedContent += extractedText;
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg,
                  ),
                );
                continue;
              }
            }

            // 尝试标准JSON解析
            try {
              const { content } = JSON.parse(chunk);
              if (typeof content === "string") {
                accumulatedContent += content;
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg,
                  ),
                );
              }
            } catch (jsonError) {
              // JSON解析失败，但不抛出错误
              console.debug("Non-JSON chunk received:", chunk);
            }
          } catch (e) {
            // 记录错误但继续处理
            console.debug("Error processing chunk:", chunk, e);
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
            <span>{t("title")}</span>
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
            <div className={styles.messageList} ref={messageListRef}>
              {messages.length === 0 &&
                Array.isArray(suggestedTopics) &&
                suggestedTopics.length > 0 && (
                  <div className={styles.topicsList}>
                    <div className={styles.topicsHeader}>
                      {t("suggestedTopics")}
                    </div>
                    {suggestedTopics.map((topic, index) => (
                      <div
                        key={index}
                        className={styles.topicItem}
                        onClick={() => handleTopicClick(topic)}
                      >
                        {topic.title}
                      </div>
                    ))}
                  </div>
                )}

              {messages.map((message, index) => (
                <div
                  key={index}
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
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
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
                      // 添加表格样式
                      table({ node, ...props }) {
                        return (
                          <div className={styles.tableContainer}>
                            <table
                              className={styles.markdownTable}
                              {...props}
                            />
                          </div>
                        );
                      },
                      // 添加标题样式
                      h1: ({ node, ...props }) => (
                        <h1 className={styles.markdownH1} {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className={styles.markdownH2} {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className={styles.markdownH3} {...props} />
                      ),
                      // 添加引用块样式
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className={styles.markdownBlockquote}
                          {...props}
                        />
                      ),
                      // 添加列表样式
                      ul: ({ node, ...props }) => (
                        <ul className={styles.markdownList} {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className={styles.markdownList} {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className={styles.markdownParagraph} {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className={styles.markdownLink} {...props} />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))}
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

      <ScreenCapture
        onCapture={handleImageAnalysis}
        onScreenshotEnd={handleScreenshotEnd}
        isSelecting={isScreenshotting}
        onQuestionSelected={handleShowChat}
      />
    </>
  );
}
