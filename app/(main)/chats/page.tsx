import ChatList from "@/components/chat/ChatList";

export default function ChatsPage() {
  return (
    <div className="h-screen flex">
      {/* Sol taraf - Sohbet listesi */}
      <div className="w-full md:w-96">
        <ChatList />
      </div>

      {/* Sağ taraf - Boş alan (desktop) */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">Bir sohbet seçin</p>
          <p className="text-sm mt-2">Mesajlaşmaya başlamak için sol taraftan bir sohbet seçin</p>
        </div>
      </div>
    </div>
  );
}

