"use client";
import { Application, Graphics } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Eraser, Palette, Pencil, Save, Trash } from "lucide-react";

type ToolId = "pencil" | "save" | "clear" | "color" | "eraser";

export default function CanvasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const currentLineRef = useRef<Graphics | null>(null);
  const isDrawingRef = useRef(false);

  const [selectedTool, setSelectedTool] = useState<ToolId>("pencil");
  const [currentColor, setCurrentColor] = useState("#000000"); // Siyah
  const [brushSize, setBrushSize] = useState(3);

  // State'leri ref'lere de kaydet (event handler'lar için güncel değerler)
  const selectedToolRef = useRef<ToolId>(selectedTool);
  const currentColorRef = useRef(currentColor);
  const brushSizeRef = useRef(brushSize);

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

        // Başlangıç noktası
        const pos = event.global;
        line.moveTo(pos.x, pos.y);
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

        // Çizgi çiz
        currentLineRef.current
          .lineTo(pos.x, pos.y)
          .stroke({ width: drawSize, color: drawColor });
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
    // Tüm çizimleri temizle
    appRef.current.stage.removeChildren();
    console.log("Canvas temizlendi");
  };

  const handleSave = () => {
    if (!appRef.current) return;
    // Canvas'ı PNG olarak indir
    const canvas = appRef.current.canvas;
    const dataURL = canvas.toDataURL("image/png");
    
    const link = document.createElement("a");
    link.download = `canvas-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    console.log("Canvas kaydedildi");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Canvas - Çizim Yap
        </h1>
        
        {/* Tool Bar */}
        <div className="flex gap-3 items-center justify-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Pencil */}
          <button
            className={`p-3 rounded-lg transition-all ${
              selectedTool === "pencil"
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
            className={`p-3 rounded-lg transition-all ${
              selectedTool === "eraser"
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
          className="border-4 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white cursor-crosshair"
        />

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Kullanım:</strong> Kalem seçili, mouse ile canvas üzerinde çizim yapabilirsin!
          </p>
        </div>
      </div>
    </div>
  );
}