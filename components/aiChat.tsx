"use client";
import { useState, useEffect, useRef } from "react";
import { MessageOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "@/src/css/ai-chat.module.css";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { useTranslations } from "next-intl";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface SuggestedTopic {
  title: string;
  content?: string;
}

export default function AIChat() {
  const t = useTranslations("common.aiChat");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // 自动滚动到底部
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // 添加用户消息
    const userMessage: Message = {
      role: "user" as const,
      content: textToSend,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      // 创建新的 AI 消息
      const aiMessageId = Date.now().toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant" as const,
        content: "",
      };
      setMessages([...newMessages, aiMessage]);

      // 发送消息到 API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 创建 ReadableStream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedContent = "";

      // 读取流数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const chunks = text.split("\n").filter(Boolean);

        for (const chunk of chunks) {
          try {
            // 处理结束标记
            if (chunk.startsWith("e:") || chunk.startsWith("d:")) {
              console.log("Stream completed:", chunk);
              continue;
            }

            // 处理文本内容
            if (chunk.startsWith("0:")) {
              const text = chunk.substring(3).replace(/^"|"$/g, "");
              console.log("Extracted text:", text);

              if (text) {
                // 处理特殊字符
                const processedText = text
                  .replace(/\*\*/g, "**") // 保持加粗标记
                  .replace(/```/g, "\n```") // 确保代码块前后有换行
                  .replace(/\n+/g, "\n") // 规范化换行
                  .replace(/\\n/g, "\n"); // 处理转义的换行符

                accumulatedContent += processedText;
                console.log("Updated content:", accumulatedContent);

                setMessages((prevMessages) => {
                  const newMessages = prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg,
                  );
                  console.log("Updated messages:", newMessages);
                  return newMessages;
                });
              }
            }
          } catch (e) {
            console.error("Error processing chunk:", e, chunk);
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setError(t("error.network"));
      } else if (
        error instanceof Error &&
        error.message.includes("HTTP error")
      ) {
        setError(t("error.server"));
      } else {
        setError(t("error.send"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={styles.chatButton}>
        <MessageOutlined />
      </button>

      {isOpen && (
        <div ref={chatRef} className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>{t("title")}</span>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.messageList}>
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

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage
                  }`}
                >
                  <ReactMarkdown
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
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}
              {loading && <div className={styles.loading}>{t("thinking")}</div>}
              {error && <div className={styles.error}>{error}</div>}
              <div ref={messageEndRef} />
            </div>

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
    </>
  );
}
