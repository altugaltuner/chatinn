"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  created_at?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Kullanıcılar yüklenemedi:", err);
        setLoading(false);
      });
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Kullanıcılar</h1>
        <p className="text-slate-600">Toplam {users.length} kullanıcı</p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer"
          >
            {/* Profil Resmi Container */}
            <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-6 flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={user.picture || "/defaultpp.jpg"}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="p-5 text-center">
              <h2 className="text-lg font-bold text-slate-800 mb-2 truncate">{user.name}</h2>
              <p className="text-sm text-slate-500 mb-3 truncate">{user.email}</p>

              {/* Action Button */}
              <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                <Link href={`/user/${user.id}`}>Profili Gör</Link>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
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
          <p className="text-slate-500">Henüz kullanıcı bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
