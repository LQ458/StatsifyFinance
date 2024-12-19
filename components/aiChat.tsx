"use client";
import { useState, useEffect, useRef } from "react";
import { MessageOutlined } from "@ant-design/icons";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from "@/src/css/ai-chat.module.css";
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SuggestedTopic {
  title: string;
  content: string;
}

export default function AIChat() {
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
    if(isOpen) {
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
          pageType: window.location.pathname.includes("quantitative") ? "quantitative" : "qualitative"
        }),
      });
      
      const data = await response.json();
      if(data.success) {
        setSuggestedTopics(data.topics);
      }
    } catch (error) {
      console.error("Failed to get topics:", error);
    }
  };

  const handleTopicClick = (topic: SuggestedTopic) => {
    handleSend(topic.title);
  };

  const handleSend = async (message?: string) => {
    const textToSend = message || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: "user" as const,
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    if(!message) setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: data.message,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
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
            <span>AI 助手</span>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.messageList}>
              {messages.length === 0 && suggestedTopics.length > 0 && (
                <div className={styles.topicsList}>
                  <div className={styles.topicsHeader}>建议的话题:</div>
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
                    msg.role === "user" ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow as SyntaxHighlighterProps['style']}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}
              {loading && <div className={styles.loading}>AI正在思考...</div>}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入您的问题..."
                className={styles.input}
              />
              <button
                onClick={() => handleSend()}
                className={styles.sendButton}
                disabled={loading}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}