import ChatWindow from "@/components/chat/ChatWindow";

export default async function ChatIdPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  console.log(chatId, "chatId");

  return <ChatWindow chatId={chatId} />;
}
