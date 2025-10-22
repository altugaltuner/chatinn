"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

// Mock veriler
const mockChats: Chat[] = [
  { id: "1", name: "Ahmet Yılmaz", lastMessage: "Merhaba nasılsın?", time: "10:30", unread: 2 },
  { id: "2", name: "Ayşe Demir", lastMessage: "Toplantı saat kaçta?", time: "09:15" },
  { id: "3", name: "Mehmet Kaya", lastMessage: "Teşekkürler!", time: "Dün", unread: 1 },
  { id: "4", name: "Zeynep Şahin", lastMessage: "Görüşürüz 👋", time: "Dün" },
];

export default function ChatList() {
  const pathname = usePathname();

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sohbetler</h2>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto">
        {mockChats.map((chat) => {
          const isActive = pathname === `/chats/${chat.id}`;
          
          return (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className={`block p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isActive ? "bg-blue-50 dark:bg-gray-700" : ""
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
                    {chat.unread && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

