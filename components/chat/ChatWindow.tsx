"use client";

import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface ChatWindowProps {
  chatId: string;
  chatName: string;
}

// Mock mesajlar
const getMockMessages = (chatId: string): Message[] => {
  const messages: Record<string, Message[]> = {
    "1": [
      { id: "1", text: "Merhaba! Nasılsın?", sender: "other", time: "10:25" },
      { id: "2", text: "İyiyim teşekkürler, sen nasılsın?", sender: "me", time: "10:26" },
      { id: "3", text: "Ben de iyiyim, çok teşekkürler", sender: "other", time: "10:30" },
    ],
    "2": [
      { id: "1", text: "Toplantı saat kaçta?", sender: "other", time: "09:15" },
      { id: "2", text: "Saat 14:00'te başlayacak", sender: "me", time: "09:20" },
    ],
    "3": [
      { id: "1", text: "Dosyaları gönderdim", sender: "me", time: "Dün" },
      { id: "2", text: "Teşekkürler!", sender: "other", time: "Dün" },
    ],
    "4": [
      { id: "1", text: "Yarın görüşelim mi?", sender: "me", time: "Dün" },
      { id: "2", text: "Olur, görüşürüz 👋", sender: "other", time: "Dün" },
    ],
  };
  
  return messages[chatId] || [];
};

const getChatName = (chatId: string): string => {
  const names: Record<string, string> = {
    "1": "Ahmet Yılmaz",
    "2": "Ayşe Demir",
    "3": "Mehmet Kaya",
    "4": "Zeynep Şahin",
  };
  return names[chatId] || "Bilinmeyen";
};

export default function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>(getMockMessages(chatId));
  const [newMessage, setNewMessage] = useState("");
  const chatName = getChatName(chatId);

  const handleSend = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "me",
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{chatName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span
                className={`text-xs mt-1 block ${
                  message.sender === "me" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesaj yazın..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

