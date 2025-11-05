"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_by: number;
  created_at: string;
  population: number;
}

export default function GroupPage({ params }: { params: Promise<{ groupsId: string }> }) {
  const { groupsId } = use(params); // react.use hook'u ile params'ı alıyoruz. çünkü params promise'dir.
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  console.log(user, "user");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isPublicGroup, setIsPublicGroup] = useState<boolean>(false);

  useEffect(() => {
    // User yoksa kontrolü atlama
    if (!user?.id) {
      setIsMember(false);
      return;
    }

    // Query parameter olarak user_id gönder
    fetch(`http://localhost:3001/api/groups/${groupsId}/is-member?user_id=${user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "isMember");
        if (data.success) {
          setIsMember(data.is_member);
        } else {
          console.error("Hata:", data.error);
          setIsMember(false);
        }
      })
      .catch((err) => {
        console.error("Grupa katılım durumu yüklenemedi:", err);
        setIsMember(false);
      });
  }, [groupsId, user?.id]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/groups/${groupsId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "group");
        setIsPublicGroup(data.is_public);
        setGroup(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Grup yüklenemedi:", err);
        setLoading(false);
      });
  }, [groupsId]);

  const handleJoinGroup = () => {
    if (!user?.id) {
      alert("Lütfen önce giriş yapın!");
      return;
    }
    if (isPublicGroup) {
      router.push(`/groups/${groupsId}`);

      console.log("Gruba katılma isteği gönderiliyor:", { user_id: user.id, groupsId });

      fetch(`http://localhost:3001/api/groups/${groupsId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }), // group_id URL'den alınıyor, body'de gerek yok
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Sunucu yanıtı:", data);
          if (data.success === true) {
            window.location.reload(); // Sayfayı yenile
          } else {
            alert("❌ " + data.error);
          }
        })
        .catch((err) => {
          console.error("Grupa katılım isteği gönderilemedi:", err);
          alert("❌ Bağlantı hatası!");
        });
    } else if(isPublicGroup === false) {
      fetch(`http://localhost:3001/api/groups/${groupsId}/join`, { // buraya değil
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Sunucu yanıtı:", data);
        });
    }
  }

  useEffect(() => {
    fetch(`http://localhost:3001/api/groups/${groupsId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "messages");
        setMessages(data);
      })
      .catch((err) => {
        console.error("Mesajlar yüklenemedi:", err);
      });
  }, [groupsId]);

  useEffect(() => {
    console.log('🔍 Üye listesi fetch ediliyor, groupsId:', groupsId);
    fetch(`http://localhost:3001/api/groups/${groupsId}/members`)
      .then((res) => {
        console.log('📡 Response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('📦 Gelen data:', data);
        if (data.success && data.members) {
          console.log('✅ Members set ediliyor:', data.members);
          setMembers(data.members);
        } else {
          console.warn('⚠️ Data success değil veya members yok:', data);
          setMembers([]);
        }
      })
      .catch((err) => {
        console.error("❌ Üye listesi yüklenemedi:", err);
        setMembers([]);
      });
  }, [groupsId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Grup yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Grup Bulunamadı
          </h2>
          <p className="text-slate-600">Bu grup mevcut değil veya silinmiş olabilir.</p>
        </div>
      </div>
    );
  }

  // İstatistikler
  const stats = {
    population: group.population,
    created_by: group.created_by,
    created_at: group.created_at,
    is_public: group.is_public,
    description: group.description,
    name: group.name,
  };

  if (isMember === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Grupa katılım durumu yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (!isMember) {
    return (
      <div className="min-h-screen bg-white dark:bg-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Ana Grup Kartı */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Header Background */}
            <div className="h-48 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
              <div className="absolute inset-0 bg-white opacity-5"></div>
            </div>

            {/* Grup Resmi ve Bilgiler */}
            <div className="relative px-8 pb-8">
              {/* Grup Resmi */}
              <div className="flex justify-center -mt-24 mb-6">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full border-8 border-gray-50 dark:border-gray-900 overflow-hidden shadow-2xl">
                    <img src={group.created_by.toString() || "/defaultpp.jpg"} alt={group.created_by.toString()} />
                  </div>
                  {/* Online Indicator */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 bg-gray-900 dark:bg-white rounded-full border-4 border-gray-50 dark:border-gray-900"></div>
                </div>
              </div>

              {/* Grup Adı ve Açıklama */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-black dark:text-white mb-2">{group.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-1">{group.description}</p>
                {group.created_by && (
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    Oluşturucu: {group.created_by}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Oluşturulma Tarihi:{" "}
                  {group.created_at
                    ? new Date(group.created_at).toLocaleDateString("tr-TR")
                    : "Bilinmiyor"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <button onClick={handleJoinGroup} className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  {isPublicGroup ? "Gruba Katıl" : "Gruba İstek At"}
                </button>
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="text-4xl font-bold text-black dark:text-white mb-2">
                    {stats.population}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Üye Sayısı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sol Sidebar - Grup Üyeleri */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {group.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {group.population} üye
          </p>
        </div>

        {/* Üye Listesi */}
        <div className="flex-1 overflow-y-auto">
          {members.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Henüz üye yok
            </div>
          ) : (
            members.map((member) => (
              <div
                onClick={() => router.push(`/user/${member.id}`)}
                key={member.user_id}
                className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {member.picture ? (
                      <img
                        src={member.picture}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {member.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    {/* Online Indicator */}
                    {member.is_online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  {/* İsim ve Durum */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {member.name}
                      </h3>
                      {/* Admin Badge */}
                      {member.is_admin && (
                        <span className="text-yellow-500 text-xs">👑</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.is_online ? "Çevrimiçi" : "Çevrimdışı"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ Taraf - Mesajlaşma Alanı */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Mesajları İndir
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {/* Örnek Mesajlar - Şimdilik statik */}
          {[
            { id: 1, sender: "ayşedemir", message: "Selam 1! Nasılsın?", time: "12:06", isMe: false },
            { id: 2, sender: "me", message: "rfrfrfr", time: "12:08", isMe: true },
            { id: 3, sender: "mehmetaslan", message: "Bugün toplantı var mı?", time: "12:10", isMe: false },
            { id: 4, sender: "me", message: "Evet saat 3'te", time: "12:12", isMe: true },
            { id: 5, sender: "zeynepkaya", message: "Ben de katılacağım", time: "12:15", isMe: false },
          ].map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] ${msg.isMe ? "" : "flex items-start gap-2"}`}>
                {/* Avatar (sadece diğer kullanıcılar için) */}
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {msg.sender.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div>
                  {/* Gönderen adı (sadece diğer kullanıcılar için) */}
                  {!msg.isMe && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                      {msg.sender}
                    </p>
                  )}

                  {/* Mesaj balonu */}
                  <div
                    className={`rounded-lg px-4 py-2 ${msg.isMe
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                      }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span
                      className={`text-xs mt-1 block ${msg.isMe ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mesaj yazın..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  )





}
