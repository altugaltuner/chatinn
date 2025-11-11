"use client";

import { useState, useEffect, useRef } from "react";
import { joinRoom, sendMessage, onMessage, offMessage } from "@/lib/socket";
import { createDMRoomId } from "@/lib/roomUtils";
import { getCurrentUserId,getChats } from "@/lib/getChats";
import { ClipboardIcon } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface ChatTitles{
  id: number;
  name: string;
}


export default function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatTitles, setChatTitles] = useState<ChatTitles[]>([]);
  const chatTitle = chatTitles.find(chat => chat.id === parseInt(chatId))?.name;

  // Konuşmaları yükle
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        const conversations = await getChats(userId);
        setChatTitles(conversations);
      } catch (err) {
        console.error('Konuşmalar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const getCopy = async () => {
    const roomId = getRoomId();
    if (!roomId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${roomId}/download`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        console.log("Mesajlar indirildi:", data);
        // Blob = Binary Large Object (dosya verisi)
        const blob = new Blob([data.messages], { type: "text/plain; charset=utf-8" });
       //5. Geçici URL oluşturuluyor:
       //Örn: "blob:http://localhost:3000/a1b2c3d4-e5f6-..."
        const url = URL.createObjectURL(blob);
        //6. Sanal bir <a> elementi oluşturuluyor:
        //<a href="blob:http://localhost:3000/a1b2c3d4-e5f6-..." download="mesajlar.txt">Mesajları İndir</a>
        const a = document.createElement("a");
        a.href = url;
        //7. Dosya adı oluşturuluyor:
        const fileName = chatTitle ? `${chatTitle}_mesajlar.txt` : `${roomId}_mesajlar.txt`;
        //8. Dosya indirme linki tıklanıyor:
        //<a href="blob:http://localhost:3000/a1b2c3d4-e5f6-..." download="mesajlar.txt">Mesajları İndir</a>
        a.download = fileName;
        a.click(); // Sanki kullanıcı tıkladı gibi dosya indiriliyor        a.click();
        //10. Geçici URL siliniyor:
        //Örn: "blob:http://localhost:3000/a1b2c3d4-e5f6-..."
        URL.revokeObjectURL(url); // Bellek temizliği
      } else {
        console.error('Mesajlar indirilemedi:', data.error);
      }
    } catch (err) {
      console.error('Mesajlar indirilirken hata:', err);
    }
  };


  // ChatId'yi roomId formatına çevir (eğer sayıysa)
  const getRoomId = (): string => {
    // Eğer chatId zaten dm_ ile başlıyorsa olduğu gibi kullan
    if (chatId.startsWith('dm_')) {
      return chatId;
    }

    // Değilse formatlama yaparız. `dm_${minId}_${maxId}` createDMRoomId sayesinde
    const currentUserId = getCurrentUserId();
    const receiverUserId = parseInt(chatId);
    return createDMRoomId(currentUserId, receiverUserId);
  };

  // Eski mesajları veritabanından yükle
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const roomId = getRoomId();
        console.log('🔍 Mesajlar yükleniyor, roomId:', roomId);
        const response = await fetch(`http://localhost:3001/api/messages/${roomId}`);
        const data = await response.json();

        if (data.success) {
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.message,
            sender: msg.sender_id === getCurrentUserId() ? "me" : "other",
            time: new Date(msg.created_at).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error('Mesajlar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Socket.IO bağlantısını kur
  useEffect(() => {
    const roomId = getRoomId();
    console.log('🔌 Socket odasına katılınıyor, roomId:', roomId);

    // Chat odasına katıl
    joinRoom(roomId);

    // burada zaten useeffect çalıştıgı zaman onMessage tanımlanmıştı. 
    onMessage((data: any) => {
      console.log('📨 Yeni mesaj alındı:', data);

      // Duplikasyonu önle - eğer mesaj zaten listede varsa ekleme
      setMessages((prev) => {
        const exists = prev.some(msg => msg.id === data.id?.toString());
        if (exists) return prev;

        const newMsg: Message = {
          id: data.id?.toString() || Date.now().toString(),
          text: data.message,
          sender: data.senderId === getCurrentUserId() ? "me" : "other",
          time: new Date(data.created_at || Date.now()).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...prev, newMsg];
      });
    });

    // Cleanup - component unmount olduğunda
    return () => {
      offMessage();
    };
  }, [chatId]);

  // Mesajlar güncellendiğinde scroll'u en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (user) {
        const roomId = getRoomId();

        // Socket.IO ile mesaj gönder
        sendMessage({
          roomId: roomId,
          message: newMessage,
          senderId: user.id,
          senderName: user.name,
        });

        // Input'u temizle - mesaj socket response'undan gelecek
        setNewMessage("");
      }
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
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {chatTitle}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sohbet başlığı</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => getCopy()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-medium px-3 py-2 shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
              title="Mesajları indir"
            >
              <ClipboardIcon className="w-4 h-4" />
              <span>Mesajları İndir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Mesajlar yükleniyor...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Henüz mesaj yok. İlk mesajı gönderin!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <span
                  className={`text-xs mt-1 block ${message.sender === "me" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {message.time}
                </span>
              </div>
            </div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
