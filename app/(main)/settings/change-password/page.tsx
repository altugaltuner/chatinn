"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function ChangePasswordPage() {
  const { user: currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCurrent1, setShowCurrent1] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1; // En az bir büyük harf var mı?
    if (/[a-z]/.test(newPassword)) score += 1; // En az bir küçük harf var mı?
    if (/\d/.test(newPassword)) score += 1; // En az bir sayı var mı?
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1; // En az bir özel karakter var mı?
    return score; // 0 - 5
  }, [newPassword]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { color: "#ef4444" };
      case 2:
        return { color: "#f59e0b" };
      case 3:
        return { color: "#10b981" };
      case 4:
        return { color: "#059669" };
      case 5:
        return { color: "#047857" };
      default:
        return { color: "#e5e7eb" };
    }
  }, [passwordStrength]);

  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword, userId: currentUser?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Bir hata oluştu");
        setSuccess(false);
      } else {
        setSuccess(true);
        setError("");
        // Formu temizle
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // 3 saniye sonra başarı mesajını gizle
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full p-6">
      <div className="rounded-xl border border-gray-200 shadow-sm p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Şifreyi Değiştir</h1>
          <p className="text-sm text-gray-500 mt-1">Güvenli bir şifre belirleyin ve onaylayın.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut şifre
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 px-3 py-2 pr-12 text-gray-900"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Mevcut şifreyi göster/gizle"
              >
                {showCurrent ? "Gizle" : "Göster"}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Yeni şifre</label>
              <span className="text-xs text-gray-500">En az 8 karakter</span>
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 px-3 py-2 pr-12 text-gray-900"
                placeholder="Yeni şifreniz"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Yeni şifreyi göster/gizle"
              >
                {showNew ? "Gizle" : "Göster"}
              </button>
            </div>

            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: strengthLabel.color,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni şifre (tekrar)
            </label>
            <div className="relative">
              <input
                type={showCurrent1 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                  isMismatch ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Yeni şifrenizi tekrar girin"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowCurrent1((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Yeni şifre tekrarını göster/gizle"
              >
                {showCurrent1 ? "Gizle" : "Göster"}
              </button>
            </div>
            {isMismatch && (
              <p className="mt-1 text-sm text-red-600">Şifreler eşleşmiyor.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Temizle
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50 cursor-pointer"
              disabled={!currentPassword || !newPassword || !confirmPassword || isMismatch || loading}
            >
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm mt-2">Şifre başarıyla değiştirildi!</p>
          )}
        </form>
      </div>
    </div>
  );
}


