"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import { useAuth } from "@/lib/AuthContext";

export default function SignInPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            //response.json() ile response'u json formatına çevirir
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Giriş sırasında bir hata oluştu");
                setLoading(false);
                return;
            }

            // Başarılı giriş - Context'e kaydet (otomatik olarak localStorage'a da kaydedilecek)
            login(data.user);
            router.push("/chats");
        } catch (err) {
            setError("Sunucuya bağlanılamadı");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col gap-16">
            <Header />
            <div className="flex justify-center items-center h-full">
                <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
                    <h1 className="mb-2 text-3xl font-bold text-white">Giriş Yap</h1>
                    <p className="mb-6 text-sm text-gray-400">
                        Hesabınıza giriş yapın ve sohbete başlayın
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-300">
                                Kullanıcı Adı
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-500"
                                placeholder="Kullanıcı Adınız"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-600 bg-white/10 text-emerald-600 focus:ring-emerald-500"
                                />
                                Beni hatırla
                            </label>
                            <Link href="#" className="text-emerald-500 hover:text-emerald-400">
                                Şifremi unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Hesabınız yok mu?{" "}
                        <Link href="/signup" className="font-medium text-emerald-500 hover:text-emerald-400">
                            Kayıt olun
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}