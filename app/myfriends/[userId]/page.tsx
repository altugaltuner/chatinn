"use client";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import Link from "next/link";

interface Friend {
    id: number;
    name: string;
    picture?: string;
}

export default function MyFriendsPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const { user: currentUser } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState<number>(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    useEffect(() => {
        // Arkadaşları çek
        fetch(`http://localhost:3001/api/friendships/myfriends/${userId}`)
            .then(res => res.json())
            .then(data => {
                setFriends(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Arkadaşları getirme hatası:', err);
                setLoading(false);
            });

        // Bekleyen arkadaşlık isteklerini çek (sadece kendi profilinde)
        if (currentUser && currentUser.id === parseInt(userId)) {
            fetch(`http://localhost:3001/api/friendships/requests/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setPendingRequests(data.length);
                })
                .catch(err => {
                    console.error('İstekler getirilemedi:', err);
                });
        }
    }, [userId, currentUser]);

    // Dropdown dışına tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isNotificationOpen && !target.closest('.notification-dropdown')) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotificationOpen]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Arkadaşlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!friends || friends.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Henüz arkadaşınız yok
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Arkadaş ekleyerek sohbete başlayın!
                    </p>
                    <Link 
                        href="/users"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Kullanıcıları Keşfet
                    </Link>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser && currentUser.id === parseInt(userId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Başlık ve Bildirim Butonu */}
                <div className="mb-8 relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                {isOwnProfile ? 'Arkadaşlarım' : 'Arkadaşları'}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {friends.length} arkadaş bulundu
                            </p>
                        </div>

                        {/* Bildirim Butonu - Sadece kendi profilinde göster */}
                        {isOwnProfile && (
                            <div className="relative notification-dropdown">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {/* Çan İkonu */}
                                    <svg 
                                        className="w-6 h-6" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
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
                                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                        {/* Başlık */}
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                                            <h3 className="text-white font-semibold text-lg">
                                                Arkadaşlık İstekleri
                                            </h3>
                                            <p className="text-blue-100 text-sm">
                                                {pendingRequests} bekleyen istek
                                            </p>
                                        </div>

                                        {/* İçerik Alanı - Şimdilik boş */}
                                        <div className="p-4 max-h-96 overflow-y-auto">
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <p>İstekler burada görünecek...</p>
                                                <p className="text-sm mt-2">Yakında eklenecek!</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Yapısı */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            {/* Profil Resmi */}
                            <Link href={`/user/${friend.id}`}>
                                <div className="aspect-square bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity">
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={friend.picture || '/defaultpp.jpg'}
                                            alt={friend.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {/* Online Badge (optional) */}
                                    <div className="absolute bottom-3 right-3">
                                        <span className="w-4 h-4 bg-green-500 border-2 border-white rounded-full block"></span>
                                    </div>
                                </div>
                            </Link>

                            {/* Alt Kısım - Bilgiler ve Butonlar */}
                            <div className="p-4">
                                <Link href={`/user/${friend.id}`}>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                                        {friend.name}
                                    </h3>
                                </Link>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Mesaj
                                    </button>

                                    <Link 
                                        href={`/user/${friend.id}`}
                                        className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

