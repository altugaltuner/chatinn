import { Assets, Application, Sprite } from 'pixi.js';
import gsap from 'gsap';

// PixiJS devtools için global tip tanımı
declare global {
    var __PIXI_APP__: Application;
}

export const fadeFunction = async () => {
    // Container'ı bul
    const container = document.getElementById('fade-container');
    if (!container) {
        console.error('fade-container bulunamadı!');
        return;
    }

    // Create a new application
    const app = new Application();

    // Initialize with options
    await app.init({
        width: container.clientWidth,    // Container genişliği
        height: container.clientHeight,  // Container yüksekliği
        backgroundColor: 0x15deb,        // Background color
        antialias: true,                 // Enable antialiasing
        resolution: 1,                   // Resolution / device pixel ratio
        preference: 'webgl',             // or 'webgpu' // Renderer preference
    });

    // PixiJS devtools için global scope'a ekle
    globalThis.__PIXI_APP__ = app;

    // Canvas'ı belirli container'a ekle
    container.appendChild(app.canvas);

    // Start adding content to your application
    // Next.js'de public klasörüne erişim için '/' ile başlamalı
    const texture = await Assets.load('/demon-arm.png');
    const rightArm = new Sprite(texture);
    const leftArm = new Sprite(texture);
    
    // Anchor point'i merkeze ayarla (0.5 = %50, yani tam ortası)
    // Bu sayede rotation merkezden yapılır, saçma görünmez
    rightArm.anchor.set(0.8);
    leftArm.anchor.set(0.8);
    
    // Sprite'ı ekranın ortasına yerleştir
    rightArm.x = container.clientWidth / 2 +600;
    rightArm.y = container.clientHeight / 2;
    leftArm.x = container.clientWidth / 2 -600;
    leftArm.y = container.clientHeight / 2;

    app.stage.addChild(rightArm);
    app.stage.addChild(leftArm);

    // Fade animasyonu - rotation artık merkezden yapılacak
    // GSAP rotation için derece kullanır, 360 = tam tur
    gsap.to(rightArm, {
        rotation: 1, 
        x: container.clientWidth / 2 + 700, 
        y: container.clientHeight / 2 + 100, 
        duration: 1, 
        repeat: -1, 
        yoyo: true,
        ease: "power2.inOut"
    });

    // Mirror the leftArm image horizontally by setting scale.x to -1
    leftArm.scale.x = -1;
    gsap.to(leftArm, {
        rotation: -1, 
        
        x: container.clientWidth / 2 - 700, 
        y: container.clientHeight / 2 + 100, 
        duration: 1, 
        repeat: -1, 
        yoyo: true,
        ease: "power2.inOut"
    });

}