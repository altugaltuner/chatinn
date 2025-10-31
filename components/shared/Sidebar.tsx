"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="w-16 bg-gray-800 dark:bg-gray-950 flex flex-col items-center py-4 border-r border-gray-700">
      {/* Üst kısım - Navigasyon */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Sohbetler */}
        <Link
          href="/chats"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/chats") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Sohbetler"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {isActive("/chats") && <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />}
        </Link>

        {/* Arkadaşlarım */}
        <Link
          href={`/myfriends/${user?.id}`}
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/status") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Arkadaşlarım"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isActive("/status") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Kanallar */}
        <Link
          href="/channels"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/channels") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Kanallar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          {isActive("/channels") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Gruplar */}
        <Link
          href="/groups"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/groups") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Gruplar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {isActive("/groups") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>
      </div>

      {/* Alt kısım - Ayarlar ve Profil */}
      <div className="flex flex-col gap-4 w-full items-center">
        {/* Ayarlar */}
        <Link
          href="/settings"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/settings") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Ayarlar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isActive("/settings") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Profil Fotoğrafı */}
        {user && (
          <Link
            href={`/user/${user.id}`}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors"
            title={`${user.name} - Profil`}
          >
            <Image
              src={user.picture || "/defaultpp.jpg"}
              alt="Profil"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </Link>
        )}

        {/* Eğer kullanıcı giriş yapmamışsa placeholder */}
        {!user && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-500"
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
          </div>
        )}
      </div>
    </div>
  );
}
