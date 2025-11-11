"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Filter, Heart, Palette, Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type Design = {
  id: string;
  title: string;
  user_id: string;
  description: string;
  likes: number;
  createdAt: string;
  labels: string[] | string;
  url: string;
};

const designs: Design[] = [
  {
    id: "aurora-dreams",
    title: "Aurora Dreams",
    user_id: "Merve A.",
    description:
      "Glow efektleri ile gece gökyüzünü anlatan katmanlı bir ışık kompozisyonu.",
    likes: 184,
    createdAt: "2 saat önce",
    labels: ["Işık", "Soyut", "Gece"],
    url:
      "bg-gradient-to-br from-sky-300 via-emerald-200 to-purple-400 text-slate-900",
  },
  {
    id: "pixel-bloom",
    title: "Pixel Bloom",
    user_id: "Kerem Y.",
    description:
      "Pixi tuvalinde oluşturulmuş kare dokularla bahar temalı canlı bir aranjman.",
    likes: 129,
    createdAt: "Dün",
    labels: ["Pixi", "Pattern", "Bahar"],
    url:
      "bg-gradient-to-br from-pink-500 via-rose-400 to-amber-300 text-slate-50",
  },
  {
    id: "waves-of-zen",
    title: "Waves of Zen",
    user_id: "Selin K.",
    description:
      "Minimal dalga çizgileri ve sakinleşmeyi amaçlayan pastel palet tercihi.",
    likes: 92,
    createdAt: "3 gün önce",
    labels: ["Minimal", "Pastel", "Çizgisel"],
    url:
      "bg-gradient-to-br from-slate-200 via-sky-100 to-emerald-200 text-slate-900",
  },
  {
    id: "neon-noise",
    title: "Neon Noise",
    user_id: "Onur D.",
    description:
      "Karanlık arka plan üzerinde neon çizgiler ve rasterize gürültü efektleri.",
    likes: 211,
    createdAt: "1 hafta önce",
    labels: ["Neon", "Kontrast", "Future"],
    url:
      "bg-gradient-to-br from-slate-900 via-fuchsia-700 to-indigo-600 text-slate-100",
  },
  {
    id: "cosmic-splatter",
    title: "Cosmic Splatter",
    user_id: "Aylin S.",
    description:
      "Rastgele fırça sıçramalarıyla galaksi hissi veren dinamik bir kompozisyon.",
    likes: 76,
    createdAt: "10 gün önce",
    labels: ["Galaksi", "Serbest", "Enerjik"],
    url:
      "bg-gradient-to-br from-indigo-500 via-cyan-400 to-slate-200 text-slate-900",
  },
  {
    id: "sunset-grid",
    title: "Sunset Grid",
    user_id: "Emir T.",
    description:
      "Grid sistemine oturtulmuş gün batımı renkleriyle geometrik bir poster.",
    likes: 58,
    createdAt: "Geçen ay",
    labels: ["Geometrik", "Poster", "Gradient"],
    url:
      "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-slate-950",
  },
];

const callToAction = {
  title: "Senin tasarımın da burada yer alsın!",
  description:
    "Canvas üzerinde yeni bir çalışma oluştur, kaydet ve topluluğunla paylaş. En çok beğenilen tasarımlar haftalık olarak vitrine çıkıyor.",
  actionLabel: "Tuvali Aç",
  actionHref: "/canvas",
};

export default function GalleryPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [myDrawings, setMyDrawings] = useState<Design[]>([]);
  const { user: currentUser } = useAuth();
  const [allDrawings, setAllDrawings] = useState<Design[]>([]);

  const getAllDrawings = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/user_drawings");
      const data = await response.json();
      console.log("Backend'den gelen data:", data);
      
      if (data.success && data.data) {
        // Backend'den gelen veriyi Design tipine map'le
        const mappedDrawings: Design[] = data.data.map((drawing: any) => ({
          id: drawing.id?.toString() ?? crypto.randomUUID(),
          title: drawing.title ?? "İsimsiz Çizim",
          user_id: drawing.user_id?.toString() ?? "Bilinmeyen",
          description: drawing.description ?? "",
          likes: drawing.likes ?? 0,
          createdAt: drawing.created_at ?? new Date().toISOString(),
          labels: drawing.labels ?? "",
          url: drawing.url ?? ""
        }));
        
        setAllDrawings(mappedDrawings);
        console.log("✅ Tüm çizimler yüklendi:", mappedDrawings.length);
      }
    } catch (error) {
      console.error("❌ Tüm çizimleri getirme hatası:", error);
    }
  };

  useEffect(() => {
    getAllDrawings();
  }, []);

  const getMyDrawings = async (currentUserId: number | undefined) => {
    if (!currentUserId) {
      alert("Çizimlerinizi görmek için giriş yapmalısınız!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/user_drawings/${currentUserId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Çizimler getirilemedi");
      }

      //mappedDrawings dizisi yarattık, Design[] tipinde. data.drawings'ı map edip içindeki verileri eşleştirdik.
      const mappedDrawings: Design[] = (data.drawings || []).map((drawing: any) => ({
        id: drawing.id?.toString() ?? crypto.randomUUID(),
        title: drawing.title ?? "Adsız Çizim",
        user_id: drawing.user_id?.toString() ?? currentUserId.toString(),
        description: drawing.description ?? "",
        likes: drawing.likes ?? 0,
        createdAt: drawing.created_at ?? new Date().toISOString(),
        labels: drawing.labels ?? "",
        url: drawing.url ?? "",
      }));

      setMyDrawings(mappedDrawings);
      setSelectedTag("my_drawings");
    } catch (error) {
      console.error("❌ Çizimleri yükleme hatası:", error);
      alert("Çizimleriniz yüklenirken bir sorun oluştu.");
    }
  };

  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    designs.forEach((design) => {
      const labelArray = Array.isArray(design.labels) ? design.labels : [];
      labelArray.forEach((label: string) => uniqueTags.add(label));
      console.log("design.labels:", design.labels);
    });
    console.log("uniqueTags:", uniqueTags);
    return Array.from(uniqueTags).sort((a, b) => a.localeCompare(b, "tr"));
  }, []);

  const filteredDesigns = useMemo(() => {
    if (!selectedTag) return designs;
    return designs.filter((design) => {
      const labelArray = Array.isArray(design.labels) ? design.labels : [];
      return labelArray.includes(selectedTag);
    });
  }, [selectedTag]);

  if(allDrawings.length === 0) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-24">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Galeri
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Topluluğun çizim arşivine hoş geldin
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300">
                Burada ChatInn kanvasında oluşturulan en yaratıcı çalışmalar
                sergileniyor. İlham almak, yeni teknikler keşfetmek ve kendi
                stilini geliştirmek için göz at.
              </p>
            </div>
            <Link
              href={callToAction.actionHref}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            >
              <Palette className="h-4 w-4 transition-transform group-hover:-rotate-6" />
              {callToAction.actionLabel}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
              <Filter className="h-3.5 w-3.5" />
              Etiketler
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition hover:bg-white/10 ${selectedTag === null
                  ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/40"
                  : "bg-white/10 text-slate-200"
                }`}
            >
              Tümü
            </button>

            <button onClick={() => getMyDrawings(currentUser?.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition hover:bg-white/10 ${selectedTag === "my_drawings"
                  ? "bg-cyan-300 text-slate-900 shadow-lg shadow-cyan-500/40"
                  : "bg-white/10 text-slate-200"
                }`}>Bana Ait</button>


            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag ? null : tag))
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition hover:bg-white/10 ${selectedTag === tag
                    ? "bg-cyan-300 text-slate-900 shadow-lg shadow-cyan-500/40"
                    : "bg-white/10 text-slate-200"
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pt-12 lg:px-10">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {selectedTag === "my_drawings" ? (
            // Bana ait çizimler
            myDrawings.map((drawing) => (
            <article
              key={drawing.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_20px_60px_-25px_rgba(56,189,248,0.45)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                <img 
                  src={`http://localhost:3001${drawing.url}`} 
                  alt={drawing.title}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]">
                  {drawing.labels && typeof drawing.labels === 'string' && drawing.labels.split(',').map((label: string, idx: number) => (
                    <span key={idx} className={`rounded-full px-3 py-1 ${idx === 0 ? 'bg-white/80 text-slate-900' : 'bg-black/40 text-white'}`}>
                      {label.trim()}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white shadow-lg shadow-black/20 backdrop-blur">
                  <p className="font-semibold">{drawing.title}</p>
                  <p className="mt-2 text-[13px] text-white/80 line-clamp-2">
                    {drawing.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-medium text-white">{drawing.title}</span>
                  <span className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(drawing.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{drawing.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                    <Heart className="h-4 w-4 fill-cyan-300/30 text-cyan-300 transition group-hover:scale-[1.15]" />
                    {drawing.likes || 0}
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-slate-950">
                    İncele
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))
          ) : (
            // Tüm çizimler (backend'den)
            allDrawings.map((drawing) => (
            <article
              key={drawing.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_20px_60px_-25px_rgba(56,189,248,0.45)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                <img 
                  src={`http://localhost:3001${drawing.url}`} 
                  alt={drawing.title}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]">
                  {drawing.labels && typeof drawing.labels === 'string' && drawing.labels.split(',').map((label: string, idx: number) => (
                    <span key={idx} className={`rounded-full px-3 py-1 ${idx === 0 ? 'bg-white/80 text-slate-900' : 'bg-black/40 text-white'}`}>
                      {label.trim()}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white shadow-lg shadow-black/20 backdrop-blur">
                  <p className="font-semibold">{drawing.title}</p>
                  <p className="mt-2 text-[13px] text-white/80 line-clamp-2">
                    {drawing.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-medium text-white">{drawing.title}</span>
                  <span className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(drawing.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{drawing.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                    <Heart className="h-4 w-4 fill-cyan-300/30 text-cyan-300 transition group-hover:scale-[1.15]" />
                    {drawing.likes || 0}
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-slate-950">
                    İncele
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))
          )}
        </section>

        <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 px-6 py-10 text-slate-100 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.55)] backdrop-blur">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/40 blur-3xl" aria-hidden />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold text-white">
                {callToAction.title}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {callToAction.description}
              </p>
            </div>
            <Link
              href={callToAction.actionHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-slate-950"
            >
              <Palette className="h-4 w-4" />
              Tasarım Yap
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
