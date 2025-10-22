"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // TODO: Gerçek API çağrısı yapılacak
        setTimeout(() => {
            router.push("/chats");
        }, 500);
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
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                            E-posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-500"
                            placeholder="ornek@email.com"
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