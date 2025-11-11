import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri | ChatInn",
  description:
    "Topluluk tarafından oluşturulan tuval tasarımlarını keşfet, ilham al ve paylaş.",
};

export default function GalleryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl lg:h-[22rem] lg:w-[22rem]" />
        <div className="absolute right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl lg:h-80 lg:w-80" />
        <div className="absolute bottom-0 right-1/2 h-56 w-56 translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl lg:h-72 lg:w-72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_55%)]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
