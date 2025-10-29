"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";

export default function SignUpPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor!");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Kayıt sırasında bir hata oluştu");
                setLoading(false);
                return;
            }

            // Başarılı kayıt - kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem("user", JSON.stringify(data.user));
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
                    <h1 className="mb-2 text-3xl font-bold text-white">Kayıt Ol</h1>
                    <p className="mb-6 text-sm text-gray-400">
                        Yeni bir hesap oluşturun ve sohbete başlayın
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-300">
                                İsim
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

                        <div>
                            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-300">
                                Şifre Tekrar
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Zaten hesabınız var mı?{" "}
                        <Link href="/signin" className="font-medium text-emerald-500 hover:text-emerald-400">
                            Giriş yapın
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

