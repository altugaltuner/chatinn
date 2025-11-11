"use client";
import { Application, Graphics } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Eraser, Palette, Pencil, Save, Trash, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type ToolId = "pencil" | "save" | "clear" | "color" | "eraser";

export default function CanvasPage() {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const currentLineRef = useRef<Graphics | null>(null);
  const isDrawingRef = useRef(false);
  const { user: currentUser } = useAuth();
  const [selectedTool, setSelectedTool] = useState<ToolId>("pencil");
  const [currentColor, setCurrentColor] = useState("#000000"); // Siyah
  const [brushSize, setBrushSize] = useState(3);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const backgroundRef = useRef<Graphics | null>(null);

  const ensureBackground = (app: Application) => {
    if (!backgroundRef.current) {
      backgroundRef.current = new Graphics();
      backgroundRef.current.eventMode = "none";
      backgroundRef.current.zIndex = -1;
    } else {
      backgroundRef.current.clear();
    }

    backgroundRef.current.rect(0, 0, app.screen.width, app.screen.height);
    backgroundRef.current.fill("#ffffff");
    backgroundRef.current.eventMode = "none";
    backgroundRef.current.zIndex = -1;

    if (!app.stage.children.includes(backgroundRef.current)) {
      app.stage.addChild(backgroundRef.current);
    }
  };
  // State'leri ref'lere de kaydet (event handler'lar için güncel değerler)
  const selectedToolRef = useRef<ToolId>(selectedTool);
  const currentColorRef = useRef(currentColor);
  const brushSizeRef = useRef(brushSize);
  const [drawName, setDrawName] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  // Ref'leri güncelle
  useEffect(() => {
    selectedToolRef.current = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    // Canvas container'ı yoksa çık
    if (!containerRef.current) return;

    // Pixi.js Application'ı oluştur ve başlat
    const initPixi = async () => {
      const app = new Application();

      // App'i initialize et
      await app.init({
        backgroundColor: "#ffffff", // Beyaz arka plan
        width: 1000,
        height: 600,
        antialias: true,
      });

      // Pixi'nin kendi canvas'ını DOM'a ekle
      containerRef.current?.appendChild(app.canvas);

      // Canvas'ı interaktif yap
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      
      app.stage.sortableChildren = true;

      // Arka plan (beyaz) oluştur
      ensureBackground(app);

      // Mouse/Touch event listener'ları
      app.stage.on("pointerdown", (event) => {
        // Ref'lerden güncel değerleri al
        const tool = selectedToolRef.current;
        if (tool !== "pencil" && tool !== "eraser") return;

        isDrawingRef.current = true;

        // Yeni çizgi oluştur
        const line = new Graphics();
        currentLineRef.current = line;
        app.stage.addChild(line);
        line.zIndex = 1;

        // Başlangıç noktası
        const pos = event.global;

        // Ref'lerden güncel renk ve kalınlık al
        const color = currentColorRef.current;
        const size = brushSizeRef.current;

        // Silgi için beyaz renk, kalem için seçili renk
        const drawColor = tool === "eraser" ? "#ffffff" : color;
        const drawSize = tool === "eraser" ? size * 3 : size;

        // İlk noktayı belirle ve stroke başlat
        line.moveTo(pos.x, pos.y);
        line.circle(pos.x, pos.y, drawSize / 2);
        line.fill(drawColor);

        console.log("🖊️ Çizim başladı, stage children:", app.stage.children.length);
      });

      app.stage.on("pointermove", (event) => {
        if (!isDrawingRef.current || !currentLineRef.current) return;

        // Ref'lerden güncel değerleri al
        const tool = selectedToolRef.current;
        if (tool !== "pencil" && tool !== "eraser") return;

        // Mouse pozisyonu
        const pos = event.global;

        // Ref'lerden güncel renk ve kalınlık al
        const color = currentColorRef.current;
        const size = brushSizeRef.current;

        // Silgi için beyaz renk, kalem için seçili renk
        const drawColor = tool === "eraser" ? "#ffffff" : color;
        const drawSize = tool === "eraser" ? size * 3 : size;

        // Her hareket noktasında küçük bir daire çiz (brush effect)
        currentLineRef.current.circle(pos.x, pos.y, drawSize / 2);
        currentLineRef.current.fill(drawColor);
      });

      app.stage.on("pointerup", () => {
        isDrawingRef.current = false;
        currentLineRef.current = null;
      });

      app.stage.on("pointerupoutside", () => {
        isDrawingRef.current = false;
        currentLineRef.current = null;
      });

      // Referansı sakla
      appRef.current = app;
    };

    initPixi();

    // Cleanup: Component unmount olduğunda Pixi'yi temizle
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []); // ✅ Boş array - sadece mount/unmount'ta çalış!

  // Tool fonksiyonları
  const handleClear = () => {
    if (!appRef.current) return;
    // Tüm çizimleri temizle (background hariç)
    appRef.current.stage.removeChildren();
    ensureBackground(appRef.current);
    console.log("Canvas temizlendi");
  };

  const handleSave = async () => {
    if (!appRef.current) return;

    try {
      // Pixi.js'in extract.canvas metodunu çağırıp, mevcut sahnenin canvas'ını elde ediyoruz (kaydetmek için)
      const extractCanvas = await appRef.current.renderer.extract.canvas(appRef.current.stage);

      // extractCanvas'ın toBlob metodunu kullanarak, canvas'ın içeriğini Blob olarak alıyoruz
      if (extractCanvas && extractCanvas.toBlob) {
        extractCanvas.toBlob((blob) => {
          if (!blob) {
            console.error("Blob oluşturulamadı");
            return;
          }

          // Blob'dan URL oluştur ve indir
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `canvas-${Date.now()}.png`;
          link.href = url;
          link.click();

          // URL'i temizle (memory leak önleme)
          setTimeout(() => URL.revokeObjectURL(url), 100);

          console.log("✅ Canvas başarıyla kaydedildi!");
        }, "image/png");
      } else {
        console.error("Canvas toBlob metodu desteklenmiyor");
      }

    } catch (error) {
      console.error("❌ Canvas kaydetme hatası:", error);
      alert("Canvas kaydedilemedi!");
    }
  };

  const handleToolClick = (toolId: ToolId) => {
    setSelectedTool(toolId);

    if (toolId === "clear") {
      handleClear();
    } else if (toolId === "save") {
      handleSave();
    }

    console.log(`${toolId} seçildi`);
  };

  const openSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleSaveAsDrawings = async () => {
    if (!appRef.current) return;

    // Validation kontrolü
    if (!drawName.trim()) {
      alert("Lütfen çiziminize bir ad verin!");
      return;
    }

    if (!currentUser?.id) {
      alert("Çizim kaydetmek için giriş yapmalısınız!");
      return;
    }

    try {
      // Stage'de çizim var mı kontrol et
      const stageChildren = appRef.current.stage.children.filter(
        (child) => child !== backgroundRef.current
      );
      console.log("🎨 Stage bilgileri:");
      console.log("  - Çocuk sayısı (arka plan hariç):", stageChildren.length);
      console.log("  - Renderer tipi:", appRef.current.renderer.type);

      // Eğer hiç çizim yoksa uyar
      if (stageChildren.length === 0) {
        alert("Canvas'ta henüz hiçbir şey çizmediniz!");
        return;
      }

      // Pixi stage'inden resim çıkart
      const extractCanvas = await appRef.current.renderer.extract.canvas(appRef.current.stage);

      //extractCanvas değişkeninin gerçekten bir HTMLCanvasElement olup olmadığını kontrol ediyor. 
      // Pixi’nin renderer.extract.canvas(...) metodu normalde bir canvas döndürmeli, ama beklenmedik bir
      //  durumda null, undefined ya da farklı türde bir obje dönebilir. instanceof HTMLCanvasElement koşulu 
      // bu kontrolü yapıp güvence sağlıyor.
      if (!(extractCanvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas verisi alınamadı");
      }


      //extractCanvas gerçek bir HTMLCanvasElement olduğu için, burada toDataURL("image/png") metodunu çağırıyoruz. 
      // Bu metodun yaptığı: Canvas üzerinde çizilmiş olan tüm piksel verisini okuyor.
      // Bu veriyi seçtiğin formata göre ("image/png") sıkıştırıp dönüştürüyor.
      // Sonuçta data:image/png;base64,iVBORw0KGgo... şeklinde bir Base64 kodlu string üretiyor.
      // Biz de bu Base64 stringi dataUrl değişkeninde tutup backend’e gönderiyoruz. 
      // Sunucu bu veriyi alıp dosyaya yazdığında, tarayıcıda çizdiginiz görüntüyü yeniden oluşturabiliyoruz.

      const dataUrl = extractCanvas.toDataURL("image/png");

      console.log("📤 Çizim kaydediliyor...");
      console.log("  - Başlık:", drawName);
      console.log("  - Etiketler:", tags);
      console.log("  - Açıklama:", description.substring(0, 50) + "...");
      console.log("  - Kullanıcı ID:", currentUser?.id);
      console.log("  - Canvas boyutu:", extractCanvas.width, "x", extractCanvas.height);
      console.log("  - DataURL uzunluğu:", dataUrl.length);
      console.log("  - DataURL başlangıcı:", dataUrl.substring(0, 100));

      const response = await fetch("http://localhost:3001/api/user_drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: drawName,
          labels: tags,
          description: description,
          imageData: dataUrl,
          user_id: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Sunucu hatası: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log("✅ Sunucu yanıtı:", data);

      if (data.success) {
        alert(`✅ "${drawName}" başarıyla kaydedildi! Galeri sayfanızda görüntüleyebilirsiniz.`);
        // Formu temizle
        setDrawName("");
        setTags("");
        setDescription("");
      } else {
        throw new Error(data.error || "Çizim kaydedilemedi");
      }
    } catch (error) {
      console.error("❌ Çizim kaydetme hatası:", error);
      alert(`Çizim kaydedilemedi! Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeSaveModal}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 backdrop-blur-md transition-opacity duration-300" />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white text-left shadow-2xl ring-1 ring-black/10 dark:bg-slate-900 dark:ring-white/10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-inner dark:bg-blue-400/10 dark:text-blue-400">
                  <Save className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Çizimi Kaydet</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Çiziminize isim, etiket ve kısa bir açıklama ekleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-500 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                onClick={closeSaveModal}
                aria-label="Kaydetme penceresini kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-6 pb-6 pt-4">
              <div>
                <label htmlFor="draw-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Çizim Adı
                </label>
                <input
                  id="draw-name"
                  type="text"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
                  placeholder="Örn. Gecenin Renkleri"
                  value={drawName}
                  onChange={(e) => setDrawName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="draw-tags" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Etiketler
                </label>
                <input
                  id="draw-tags"
                  type="text"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
                  placeholder="Örn. doğa, gece, taze renkler"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="draw-description" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Açıklama
                </label>
                <textarea
                  id="draw-description"
                  className="h-28 w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
                  placeholder="Çiziminizin hikayesini kısa bir notla paylaşın."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-slate-50 px-6 py-6 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kaydettiğiniz çizimler galeri sayfanızda görüntülenir. Dilerseniz daha sonra içerikleri güncelleyebilirsiniz.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                  onClick={closeSaveModal}
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  onClick={async () => {
                    await handleSaveAsDrawings();
                    closeSaveModal();
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Canvas - Çizim Yap
        </h1>

        {/* Tool Bar */}
        <div className="flex gap-3 items-center justify-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Pencil */}
          <button
            className={`p-3 rounded-lg transition-all ${selectedTool === "pencil"
                ? "bg-blue-600 text-white shadow-lg scale-110"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            onClick={() => handleToolClick("pencil")}
            title="Kalem"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Eraser */}
          <button
            className={`p-3 rounded-lg transition-all ${selectedTool === "eraser"
                ? "bg-blue-600 text-white shadow-lg scale-110"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            onClick={() => handleToolClick("eraser")}
            title="Silgi"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              title="Renk Seç"
            />
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Kalınlık:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-6">
              {brushSize}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

          {/* Clear */}
          <button
            className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
            onClick={() => handleToolClick("clear")}
            title="Temizle"
          >
            <Trash className="w-5 h-5" />
          </button>

          {/* Save */}
          <button
            className="p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all"
            onClick={() => handleToolClick("save")}
            title="Kaydet"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>

        {/* Pixi canvas buraya eklenecek */}
        <div
          ref={containerRef}
          className="border-4 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white cursor-crosshair w-[900px] h-[600px]"
        />

        {/* Info */}
        <div className="flex justify-between items-center gap-2">
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Kullanım:</strong> Kalem seçili, mouse ile canvas üzerinde çizim yapabilirsin!
            </p>
          </div>
          {/* Save */}
          <button
            className="p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all"
            onClick={openSaveModal}
            title="Çizim Olarak Kaydet"
          >
            Çizim Olarak Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}