"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  picture?: string;
}

export default function ChatList() {
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Mevcut kullanıcının ID'sini al
  const getCurrentUserId = (): number => {
    if (typeof window === 'undefined') return 0;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || 0;
    }
    return 0;
  };

  // Konuşmaları yükle
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          console.error('Kullanıcı ID bulunamadı');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/messages/conversations/${userId}`);
        const data = await response.json();

        if (data.success) {
          // Zamanı formatla
          const formattedChats = data.conversations.map((conv: any) => {
            const messageDate = new Date(conv.time);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let timeString: string;

            if (messageDate.toDateString() === today.toDateString()) {
              // Bugünse saat:dakika göster
              timeString = messageDate.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (messageDate.toDateString() === yesterday.toDateString()) {
              timeString = "Dün";
            } else {
              // Daha eskiyse tarih göster
              timeString = messageDate.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              });
            }

            return {
              ...conv,
              time: timeString,
            };
          });

          setChats(formattedChats);
        }
      } catch (err) {
        console.error('Konuşmalar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

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
            const isActive = pathname === `/chats/${chat.id}`;

            return (
              <Link
                key={chat.id}
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
