"use client";
import { useState, useEffect, useRef } from "react";
import { FloatButton } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import styles from "@/src/css/ai-chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
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
      <FloatButton
        icon={<MessageOutlined />}
        onClick={() => setIsOpen(true)}
        className={styles.chatButton}
      />

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
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage}`}
                >
                  {msg.content}
                </div>
              ))}
              {loading && <div className={styles.loading}>AI正在思考...</div>}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入您的问题..."
                className={styles.input}
              />
              <button
                onClick={handleSend}
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
