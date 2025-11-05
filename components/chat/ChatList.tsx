"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getChats, getCurrentUserId } from "@/lib/getChats";

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  picture?: string;
  otherUserId?: number;
}

export default function ChatList() {
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Konuşmaları yükle
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        const conversations = await getChats(userId);
        setChats(conversations);
      } catch (err) {
        console.error('Konuşmalar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const markAsRead = (chatId: number, otherUserId?: number) => {
    const me = getCurrentUserId();
    if (!otherUserId) return;
    fetch(`http://localhost:3001/api/messages/read/${otherUserId}?currentUserId=${me}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "data");
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
      })
      .catch((err) => {
        console.error(err, "err");
      });
  };


  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sohbetler</h2>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500 dark:text-gray-400">Henüz mesajlaşma yok</p>
          </div>
        ) : (
          chats.map((chat) => {
            console.log(chat, "chat");
            const isActive = pathname === `/chats/${chat.id}`;
            return (
              <Link
                onClick={() => markAsRead(chat.id, chat.otherUserId)}
                key={`${chat.id}-${chat.otherUserId ?? ''}`}
                href={`/chats/${chat.id}`}
                className={`block p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-blue-50 dark:bg-gray-700" : ""
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {chat.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread && chat.unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
