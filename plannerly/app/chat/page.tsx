"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load messages from localStorage if available
    const stored = localStorage.getItem("plannerly-messages");
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse messages from storage", err);
      }
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem("plannerly-messages", JSON.stringify(messages));
    // Scroll to bottom on update
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      if (!response.body) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response || "" }]);
        setIsTyping(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: assistantContent }];
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
