"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";

interface Group {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_by: number;
  created_at: string;
  population: number;
}

export default function UserProfilePage({ params }: { params: Promise<{ groupsId: string }> }) {
  const { groupsId } = use(params); // react.use hook'u ile params'ı alıyoruz. çünkü params promise'dir.
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  console.log(user, "user");

  useEffect(() => {
    fetch(`http://localhost:3001/api/groups/${groupsId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "group");
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
        if (data.success) {
          alert("✅ " + data.message);
          window.location.reload(); // Sayfayı yenile
        } else {
          alert("❌ " + data.error);
        }
      })
      .catch((err) => {
        console.error("Grupa katılım isteği gönderilemedi:", err);
        alert("❌ Bağlantı hatası!");
      });
  };

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
                Gruba İstek At
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
