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
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);

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
    }
  }, [isOpen]);

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
    }
  };

  const handleTopicClick = (topic: SuggestedTopic) => {
    handleSend(topic.title);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    const userMessage = inputValue.trim();
    setInputValue("");

    // 添加用户消息
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    try {
      // 创建新的 AI 消息
      const aiMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      // 创建 EventSource
      const eventSource = new EventSource(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      // 处理流式响应
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + data.text }
              : msg,
          ),
        );
      };

      // 处理结束
      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };
    } catch (error) {
      console.error("Failed to send message:", error);
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
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={t("placeholder")}
                className={styles.input}
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
