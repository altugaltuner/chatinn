"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";

type User = {
  id: number;
  name: string;
  bio: string;
  picture?: string;
  created_at?: string;
  last_seen?: string;
  is_online?: boolean;
};

type FriendshipStatus = "accepted" | "pending" | "rejected" | "none";

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<number, FriendshipStatus>>({});
  const { user: currentUser } = useAuth();

  // Arkadaşlık durumunu kontrol et
  const checkFriendshipStatus = async (friendId: number) => {
    if (!currentUser?.id || currentUser.id === friendId) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/friendships/status/${currentUser.id}/${friendId}`
      );
      const data = await response.json();
      
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: data.status || "none",
      }));
    } catch (err) {
      console.error(`Arkadaşlık durumu kontrol edilemedi (${friendId}):`, err);
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: "none",
      }));
    }
  };

  // Buton metnini duruma göre döndür
  const getButtonText = (status: FriendshipStatus | undefined): string => {
    switch (status) {
      case "accepted":
        return "Arkadaşım";
      case "pending":
        return "İstek Gönderildi";
      case "rejected":
        return "Arkadaşa Ekle";
      case "none":
      default:
        return "Arkadaşa Ekle";
    }
  };

  // Butonun disabled olup olmayacağını kontrol et
  const isButtonDisabled = (status: FriendshipStatus | undefined): boolean => {
    return status === "accepted" || status === "pending";
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`http://localhost:3001/api/user/${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      });
  }, [currentUser?.id]);

  useEffect(() => {
    if (users.length > 0) return;
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data) => {
        // Kendi kullanıcısını listeden çıkar
        const filteredUsers = data.filter((u: User) => u.id !== currentUser?.id);
        setUsers(filteredUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Kullanıcılar yüklenemedi:", err);
        setLoading(false);
      });
  }, [users.length, currentUser?.id]);

  // Kullanıcılar yüklendiğinde her biri için arkadaşlık durumunu kontrol et
  useEffect(() => {
    if (!currentUser?.id || users.length === 0) return;

    users.forEach((user) => {
      if (user.id !== currentUser.id) {
        checkFriendshipStatus(user.id);
      }
    });
  }, [users, currentUser?.id]);


if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Yükleniyor...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Kullanıcılar</h1>
            <p className="text-slate-600 dark:text-slate-400">{users.length} kullanıcı bulundu</p>
          </div>
          <div className="w-full max-w-sm">
            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pl-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                placeholder="Ara (isim, kullanıcı adı)"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-[1.02]">
              <div className="p-5 flex items-start gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.picture || "/defaultpp.jpg"} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  {p.is_online && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">{p.name}</h3>
                    </div>
                    <Link
                      href={`/user/${p.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                    >
                      Profili Gör
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{p.bio}</p>
                </div>
              </div>

              <div className="px-5 pb-5 flex items-center gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium">
                  Mesaj At
                </button>
                <button
                  disabled={isButtonDisabled(friendshipStatuses[p.id])}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isButtonDisabled(friendshipStatuses[p.id])
                      ? "bg-gray-400 dark:bg-gray-600 text-white dark:text-gray-300 cursor-not-allowed"
                      : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white"
                  }`}
                >
                  {getButtonText(friendshipStatuses[p.id])}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}