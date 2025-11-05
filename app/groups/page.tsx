"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import CreateGroup from "@/components/modals/createGroup";
import { useAuth } from "@/lib/AuthContext";

interface Group {
  id: number;
  name: string;
  is_public: boolean;
  created_by: number;
  created_at: Timestamp;
  population: number;
}

interface GroupRequest {
  id: number;
  group_id: number;
  user_id: number;
  status: string;
  created_at: string;
  user_name: string;
  user_picture?: string;
  group_name: string;
  created_by: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`http://localhost:3001/api/groups`)
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Groups cant be downloaded:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:3001/api/groups/group_requests?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "group requests");
        // Güvenli kontrol: data bir array mi?
        if (Array.isArray(data)) {
          setGroupRequests(data);
          setPendingRequests(data.length);
        } else {
          console.warn("Backend'den array değil başka bir veri geldi:", data);
          setGroupRequests([]);
          setPendingRequests(0);
        }
      })
      .catch((err) => {
        console.error("Group requests cant be downloaded:", err);
        setGroupRequests([]);
        setPendingRequests(0);
      });
  }, [user?.id]);

  // // Grup katılma isteklerini yükle (şimdilik mock data)
  // useEffect(() => {
  //   // TODO: Backend'den grup katılma isteklerini çek
  //   // Şimdilik örnek veri
  //   const mockRequests: GroupRequest[] = [
  //     {
  //       group_id: 1,
  //       group_name: "Yazılım Geliştiriciler",
  //       user_id: 5,
  //       user_name: "ahmetyilmaz",
  //       user_picture: "/defaultpp.jpg",
  //       created_at: new Date().toISOString(),
  //     },
  //   ];
  //   setGroupRequests(mockRequests);
  //   setPendingRequests(mockRequests.length);
  // }, []);

  const handleAcceptGroupRequest = (groupId: number, userId: number) => {
    console.log(`Grup ${groupId} için ${userId} kullanıcısının isteği kabul edildi`);
    fetch(`http://localhost:3001/api/groups/group_requests/accept/${groupId}/${userId}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "group request accepted");
      })
      .catch((err) => {
        console.error("Group request acceptance failed:", err);
      });
    // TODO: Backend'e kabul isteği gönder
    // Listeyi güncelle
    setGroupRequests(groupRequests.filter(req => !(req.group_id === groupId && req.user_id === userId)));
    setPendingRequests(prev => prev - 1);
  };

  const handleRejectGroupRequest = (groupId: number, userId: number) => {
    console.log(`Grup ${groupId} için ${userId} kullanıcısının isteği reddedildi`);
    // TODO: Backend'e red isteği gönder
    // Listeyi güncelle
    setGroupRequests(groupRequests.filter(req => !(req.group_id === groupId && req.user_id === userId)));
    setPendingRequests(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Gruplar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Henüz grup bulunamadı
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Yeni bir grup oluşturarak başlayın!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      {/* Bildirim Çan Butonu - Fixed Position */}
      <div className="fixed top-8 right-8 z-50">
        <div className="relative notification-dropdown">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {/* Çan İkonu */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Badge - İstek sayısı */}
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-50 dark:border-gray-900">
                {pendingRequests}
              </span>
            )}
          </button>

          {/* Dropdown Panel - Açılır Kapanır Alan */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-16 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Başlık */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3">
                <h3 className="text-white font-semibold text-lg">Grup Katılma İstekleri</h3>
                <p className="text-indigo-100 text-sm">{pendingRequests} bekleyen istek</p>
              </div>

              {/* İçerik Alanı */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {groupRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Bekleyen istek yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupRequests.map((request) => (
                      <div
                        key={`${request.group_id}-${request.user_id}`}
                        className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Profil Resmi */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {request.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* İsim ve Grup Bilgisi */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {request.user_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              "{request.group_name}" grubuna katılmak istiyor
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(request.created_at).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAcceptGroupRequest(request.group_id, request.user_id)
                            }
                            className="flex-1 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            ✓ Kabul Et
                          </button>
                          <button
                            onClick={() =>
                              handleRejectGroupRequest(request.group_id, request.user_id)
                            }
                            className="flex-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            ✗ Reddet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Tüm Gruplar</h1>
          <p className="text-slate-600 dark:text-slate-400">{groups.length} grup bulundu</p>
        </div>

        {/* Grid Yapısı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Grup Kur Kartı */}
          {showCreateGroupModal && (
            <CreateGroup setShowCreateGroupModal={setShowCreateGroupModal} />
          )}
          <div onClick={() => setShowCreateGroupModal(true)} className="group cursor-pointer">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-indigo-500 dark:hover:border-indigo-400">
              {/* Kare Üst Kısım - + İkonu */}
              <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-8xl font-light text-white opacity-90">
                  +
                </div>
              </div>

              {/* Alt Kısım - Grup Kur Yazısı */}
              <div  className="p-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Grup Kur
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Yeni bir grup oluştur
                </p>
              </div>
            </div>
          </div>

          {/* Mevcut Gruplar */}
          {groups.map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 hover:border-indigo-500 dark:hover:border-indigo-400">
                {/* Kare Üst Kısım - Avatar/Icon */}
                <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                  <div className="text-6xl font-bold text-white opacity-90">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Public/Private Badge */}
                  <div className="absolute top-3 right-3">
                    {group.is_public ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        🌍 Genel
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        🔒 Özel
                      </span>
                    )}
                  </div>
                  {/* Population Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                      👥 {group.population || 0}
                    </span>
                  </div>
                </div>

                {/* Alt Kısım - Bilgiler */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {group.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {group.population || 0} üye
                    </span>
                    <span className="text-xs">ID: {group.id}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
