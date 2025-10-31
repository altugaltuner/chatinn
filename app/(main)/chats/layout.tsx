import ChatList from "@/components/chat/ChatList";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex">
      {/* Sol taraf - Sohbet listesi (sadece desktop) */}
      <div className="hidden md:block md:w-96">
        <ChatList />
      </div>

      {/* Sağ taraf - Dinamik içerik */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
