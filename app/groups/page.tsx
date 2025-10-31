"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import CreateGroup from "@/components/modals/createGroup";

interface Group {
  id: number;
  name: string;
  is_public: boolean;
  created_by: number;
  created_at: Timestamp;
  population: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
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
