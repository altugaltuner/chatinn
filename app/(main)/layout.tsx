export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

