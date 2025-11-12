"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";

interface RotateAnimationProps {
  isPlaying: boolean;
}

export default function RotateAnimation({ isPlaying }: RotateAnimationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const shapeRef = useRef<PIXI.Graphics | null>(null);
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

        // Dönen kare oluştur
        const shape = new PIXI.Graphics();
        shape.rect(-40, -40, 80, 80);
        shape.fill({ color: 0x8b5cf6, alpha: 1 }); // Mor renk
        
        shape.x = app.screen.width / 2;
        shape.y = app.screen.height / 2;
        
        app.stage.addChild(shape);
        shapeRef.current = shape;

        // Dönme animasyonu
        const tl = gsap.timeline({ 
          repeat: -1,
          paused: true 
        });
        
        tl.to(shape, {
          pixi: { rotation: 360 },
          duration: 2,
          ease: "none"
        });

        timelineRef.current = tl;
      }
    });

    const handleResize = () => {
      if (appRef.current && canvasRef.current && shapeRef.current) {
        appRef.current.renderer.resize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
        shapeRef.current.x = appRef.current.screen.width / 2;
        shapeRef.current.y = appRef.current.screen.height / 2;
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
        gsap.to(shapeRef.current, {
          pixi: { rotation: 0 },
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

