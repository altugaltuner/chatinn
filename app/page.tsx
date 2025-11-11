"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/shared/Header";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kullanıcı giriş yapmışsa chats sayfasına yönlendir
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      router.push("/chats");
    }
  }, []);

  if (isLoggedIn) {
    return null; // Yönlendirme yapılırken boş sayfa göster
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Sol Taraf - Mesajlaşma */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Mesajlaşmanın
                <span className="text-emerald-600 dark:text-emerald-400"> Yeni Yolu</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                ChatInn ile arkadaşlarınız, aileniz ve sevdiklerinizle anında ve güvenli bir şekilde iletişim kurun.
              </p>
            </div>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/signup")}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Hemen Başla
              </button>
              <button
                onClick={() => router.push("/signin")}
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-lg transition-all border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                Giriş Yap
              </button>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktif Kullanıcı</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mesaj Gönderildi</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Mockup */}
          <div className="flex-1 relative">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              {/* Chat Window Mockup */}
              <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/30 rounded w-24 mb-1"></div>
                  <div className="h-2 bg-white/20 rounded w-16"></div>
                </div>
              </div>

              <div className="p-6 space-y-4 h-96 bg-gray-50 dark:bg-gray-900">
                {/* Gelen Mesaj */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 shrink-0"></div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm max-w-[70%]">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Merhaba! ChatInn'e hoş geldin 👋</p>
                    <span className="text-xs text-gray-500 dark:text-gray-500">14:23</span>
                  </div>
                </div>

                {/* Giden Mesaj */}
                <div className="flex gap-2 justify-end">
                  <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm max-w-[70%]">
                    <p className="text-sm text-white">Teşekkürler! Harika görünüyor 🚀</p>
                    <span className="text-xs text-emerald-100">14:24</span>
                  </div>
                </div>

                {/* Gelen Mesaj */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 shrink-0"></div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm max-w-[70%]">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Hemen sohbete başlayabilirsin! 💬</p>
                    <span className="text-xs text-gray-500 dark:text-gray-500">14:25</span>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Dekoratif Elementler */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Güvenli</h3>
            <p className="text-gray-600 dark:text-gray-400">Mesajlarınız uçtan uca şifreleme ile korunur.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hızlı</h3>
            <p className="text-gray-600 dark:text-gray-400">Mesajlarınız anında iletilir, hiç beklemezsiniz.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Grup Sohbetleri</h3>
            <p className="text-gray-600 dark:text-gray-400">Arkadaşlarınızla grup oluşturun, birlikte sohbet edin.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
