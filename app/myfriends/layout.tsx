import Sidebar from "@/components/shared/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sol navigasyon barı */}
      <Sidebar />

      {/* Ana içerik */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
