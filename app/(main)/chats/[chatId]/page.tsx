import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  console.log(chatId,"chatId");

  return (
    <div className="h-screen flex">
      {/* Sol taraf - Sohbet listesi (sadece desktop) */}
      <div className="hidden md:block md:w-96">
        <ChatList />
      </div>

      {/* Sağ taraf - Sohbet penceresi */}
      <div className="flex-1">
        <ChatWindow chatId={chatId} />
      </div>
    </div>
  );
}

