"use client";
import { getUsers } from "./api/index";
import Header from "@/components/shared/Header";

export default function Home() {
  const users = getUsers();
  console.log(users, "users");
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      {/* Main Content */}
      <main className="px-6 py-8">
        <p>Selam</p>
        {/* İçerik buraya gelecek */}
      </main>
    </div>
  );
}
