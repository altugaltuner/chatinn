"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Pencil } from 'lucide-react';


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

        {/* İnsanlar */}
        <Link
          href="/people"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/people") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Kullanıcılar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {isActive("/people") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Canvas */}
        <Link
          href="/canvas"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/canvas") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Canvas"
        >
          <Pencil className="w-6 h-6" />
          {isActive("/canvas") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Gallery */}
        <Link
          href="/gallery"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/gallery") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Gallery"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {isActive("/gallery") && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
          )}
        </Link>

        {/* Animations */}
        <Link
          href="/anims"
          className={`flex items-center justify-center py-3 transition-colors relative group ${
            isActive("/anims") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          title="Animasyonlar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isActive("/anims") && (
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
