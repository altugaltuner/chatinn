"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";

interface FallAnimationProps {
  isPlaying: boolean;
}

export default function FallAnimation({ isPlaying }: FallAnimationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const circleRef = useRef<PIXI.Graphics | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application();
    appRef.current = app;

    app.init({
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (canvasRef.current && app.canvas) {
        canvasRef.current.appendChild(app.canvas);

        // Düşen top oluştur
        const circle = new PIXI.Graphics();
        circle.circle(0, 0, 30);
        circle.fill({ color: 0xec4899, alpha: 1 }); // Pembe renk
        
        circle.x = app.screen.width / 2;
        circle.y = 50; // Yukarıdan başla
        
        app.stage.addChild(circle);
        circleRef.current = circle;

        // Düşme animasyonu (bounce efekti ile)
        const tl = gsap.timeline({ 
          repeat: -1,
          paused: true 
        });
        
        const fallDistance = app.screen.height - 100;
        
        tl.to(circle, {
          pixi: { y: fallDistance },
          duration: 1.2,
          ease: "bounce.out"
        })
        .to(circle, {
          pixi: { y: 50 },
          duration: 0.8,
          ease: "power2.in"
        });

        timelineRef.current = tl;
      }
    });

    const handleResize = () => {
      if (appRef.current && canvasRef.current && circleRef.current) {
        appRef.current.renderer.resize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
        circleRef.current.x = appRef.current.screen.width / 2;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      if (isPlaying) {
        timelineRef.current.play();
      } else {
        timelineRef.current.pause();
        // Başlangıç pozisyonuna dön
        gsap.to(circleRef.current, {
          pixi: { y: 50 },
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isPlaying]);

  return (
    <div 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

