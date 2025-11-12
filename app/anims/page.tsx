"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { fadeFunction } from "@/components/animations/fade";

type Animation = {
  id: string;
  name: string;
  thumbnail: string;
  color: string;
};

const animations: Animation[] = [
  { id: "1", name: "Fade In", thumbnail: "🌟", color: "from-blue-400 to-blue-600" },
  { id: "2", name: "Slide Left", thumbnail: "⬅️", color: "from-purple-400 to-purple-600" },
  { id: "3", name: "Slide Right", thumbnail: "➡️", color: "from-pink-400 to-pink-600" },


];

export default function AnimsPage() {
  const [selectedAnim, setSelectedAnim] = useState<Animation | null>(animations[0]);
  const [isPlaying, setIsPlaying] = useState(false);

 
  const startAnimation = () => {
    if (!selectedAnim ) return;
    switch (selectedAnim?.id) {
      case "1":
        fadeFunction();
        break;
      case "2":
        break;
      case "3":
        break;
    }
  } 
  useEffect(() => {
    startAnimation();
  }, [selectedAnim]);
  

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Ana Preview Alanı - Ekranın çoğunu kaplıyor */}
        <div className="flex-1 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 flex items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
              </div>
            </div>

            {/* Animation Container */}
            {selectedAnim && selectedAnim.id === "1" && (
              <div id="fade-container" className="absolute inset-0 w-full h-full">
              </div>
            )}

            {/* Animation Preview Element */}
            {selectedAnim && (
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${selectedAnim.color} shadow-2xl flex items-center justify-center text-6xl`}
                >
                  {selectedAnim.thumbnail}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {selectedAnim.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Animasyon oynatma alanı
                  </p>
                </div>
              </div>
            )}

            {!selectedAnim && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-slate-400 text-lg">
                  Bir animasyon seçin
                </p>
              </div>
            )}
          </div>

          {/* Playback Controls - Preview içinde üstte */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!selectedAnim}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedAnim
                  ? "bg-blue-500/90 backdrop-blur text-white hover:bg-blue-600 shadow-lg"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Durdur
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Oynat
                </>
              )}
            </button>

            <button
              onClick={() => setIsPlaying(false)}
              disabled={!selectedAnim}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedAnim
                  ? "bg-slate-700/90 backdrop-blur text-white hover:bg-slate-600"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Animation Selector - Altta ince */}
        <div className="h-32 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-3 flex-shrink-0">
          <div className="relative h-full">
            {/* Scrollable Container */}
            <div className="overflow-x-auto overflow-y-hidden h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <div className="flex gap-3 h-full items-center">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => setSelectedAnim(anim)}
                    className={`group relative flex-shrink-0 w-24 h-24 rounded-xl transition-all duration-200 ${selectedAnim?.id === anim.id
                        ? "ring-2 ring-blue-500 scale-105 shadow-xl"
                        : "hover:scale-105 hover:shadow-lg"
                      }`}
                  >
                    {/* Card Background */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${anim.color} ${selectedAnim?.id === anim.id ? "opacity-100" : "opacity-80"
                        } group-hover:opacity-100 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center text-white">
                      <div className="text-3xl">{anim.thumbnail}</div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedAnim?.id === anim.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll Fade Indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-800/80 to-transparent pointer-events-none rounded-l-xl" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-800/80 to-transparent pointer-events-none rounded-r-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

