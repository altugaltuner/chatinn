"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  member_count: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  created_at?: string;
  groups?: Group[];
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params); // react.use hook'u ile params'ı alıyoruz. çünkü params promise'dir.
  const { user: currentUser } = useAuth(); // Login olmuş kullanıcı
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [isFriendWithMe, setIsFriendWithMe] = useState<boolean | null>(null);
  // Bu profil sayfası login olmuş kullanıcının kendi profili mi?
  const isOwnProfile = currentUser && currentUser.id === parseInt(userId);
  const router = useRouter();

useEffect(() => {
  // currentUser yüklenene kadar bekle
  if (!currentUser?.id || !userId) return;
  
  fetch(`http://localhost:3001/api/friendships/status/${currentUser.id}/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "accepted") {
        console.log("Arkadaşım", data);
        setIsFriendWithMe(true);
      } else {
        setIsFriendWithMe(false);
      }
    })
    .catch((err) => {
      console.error("Arkadaşlık durumu yüklenemedi:", err);
      setIsFriendWithMe(null);
    });
}, [currentUser?.id, userId]);


  useEffect(() => {
    fetch(`http://localhost:3001/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Kullanıcı yüklenemedi:", err);
        setLoading(false);
      });
  }, [userId]);

  // Arkadaşlık isteği gönderme fonksiyonu
  const handleAddFriend = async () => {
    if (!currentUser) {
      alert("Arkadaş eklemek için giriş yapmalısınız!");
      return;
    }

    setSendingRequest(true);

    const requestData = {
      user_id: currentUser.id,
      friend_id: parseInt(userId),
      status: "pending",
    };

    console.log("Gönderilen veri:", requestData);

    //sunucuya istek gönder
    try {
      const response = await fetch("http://localhost:3001/api/friendships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Başarılı yanıt:", data);
        setFriendRequestSent(true); // arkadaşlık isteği gönderildi

        // 2 saniye sonra "Gönderildi" yazısını kaldır
        setTimeout(() => {
          setFriendRequestSent(false);
        }, 2000);
      } else {
        const error = await response.json();
        console.error("Hata yanıtı:", error);
        alert(error.message || "Arkadaşlık isteği gönderilemedi");
      }
    } catch (error) {
      console.error("Arkadaş ekleme hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSendingRequest(false);
    }
  };

  const routeToChat = () => {
    router.push(`/chats/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Kullanıcı Bulunamadı
          </h2>
          <p className="text-slate-600">Bu profil mevcut değil veya silinmiş olabilir.</p>
        </div>
      </div>
    );
  }

  // İstatistikler
  const stats = {
    friends: 156, // Şimdilik hardcoded
    groups: user.groups?.length || 0,
    posts: 342, // Şimdilik hardcoded
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Ana Profil Kartı */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-900">
          {/* Header Background */}
          <div className="h-48 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
            <div className="absolute inset-0 bg-white opacity-5"></div>
          </div>

          {/* Profil Resmi ve Bilgiler */}
          <div className="relative px-8 pb-8">
            {/* Profil Resmi */}
            <div className="flex justify-center -mt-24 mb-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-gray-50 dark:border-gray-900 overflow-hidden shadow-2xl">
                  <Image
                    src={user.picture || "/defaultpp.jpg"}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-gray-900 dark:bg-white rounded-full border-4 border-gray-50 dark:border-gray-900"></div>
              </div>
            </div>

            {/* İsim ve Email */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-1">{user.email}</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Katılma Tarihi:{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </p>
            </div>

            {/* Action Buttons - Sadece başkasının profilinde göster */}
            {!isOwnProfile && (
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {!isFriendWithMe && (<button
                  onClick={handleAddFriend}
                  disabled={sendingRequest || friendRequestSent}
                  className={`flex items-center gap-2 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer ${
                    friendRequestSent
                      ? "bg-green-600 text-white"
                      : "bg-black dark:bg-white text-white dark:text-black"
                  }`}
                >
                  {sendingRequest ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : friendRequestSent ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Gönderildi
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Arkadaşa Ekle
                    </>
                  )}
                </button>)}
                

                <button onClick={routeToChat} className="flex items-center gap-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-black font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Mesaj At
                </button>
              </div>
            )}

            {/* İstatistikler - Sadece başkasının profilinde göster */}
            {!isOwnProfile && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="text-4xl font-bold text-black dark:text-white mb-2">
                    {stats.friends}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Arkadaş</div>
                </div>

                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="text-4xl font-bold text-black dark:text-white mb-2">
                    {stats.groups}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Grup</div>
                </div>

                <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-2xl p-6 text-center transform hover:scale-105 transition-transform duration-200 shadow-sm">
                  <div className="text-4xl font-bold text-black dark:text-white mb-2">
                    {stats.posts}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Gönderi</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gruplar Bölümü */}
        {user.groups && user.groups.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6 mt-8">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
              <svg
                className="w-7 h-7 text-gray-800 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Üye Olduğu Gruplar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-black dark:text-white text-lg mb-1 line-clamp-1">
                        {group.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">{group.member_count} üye</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ek Bilgiler Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Hakkında */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Hakkında
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Merhaba! Ben {user.name}. Chat uygulamasında aktif bir kullanıcıyım.
            </p>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Aktivite
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Son görülme:{" "}
              <span className="text-black dark:text-white font-semibold">Çevrimiçi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
