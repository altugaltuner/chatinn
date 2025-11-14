"use client";

import { Assets, Application, Sprite, Graphics, FederatedPointerEvent, AnimatedSprite } from 'pixi.js';
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
        backgroundColor: 0x0a0001,              // Şeffaf arka plan
        antialias: true,                 // Enable antialiasing
        resolution: 1,                   // Resolution / device pixel ratio
        preference: 'webgl',             // or 'webgpu' // Renderer preference
    });

    // PixiJS devtools için global scope'a ekle
    globalThis.__PIXI_APP__ = app;

    const ground = new Graphics();
    ground.rect(0, 0, container.clientWidth, container.clientHeight/10);
    ground.fill({ color: 0x45271f, alpha: 1 });
    ground.y = container.clientHeight - (container.clientHeight/10);

    const sky = new Graphics();
    sky.rect(0, 0, container.clientWidth, container.clientHeight);
    sky.zIndex = -1;
    sky.fill({ color: 0x54b6f7, alpha: 1 });
    sky.y = 0;


    let coinCounter = 0;
    const coins: Sprite[] = []; // Aktif coin'leri takip etmek için
    
    const createCoin = async (clickedCloud: Sprite, mushroom: AnimatedSprite) => {
        coinCounter += 1;
        const coin = new Sprite(await Assets.load('/coin.png'));
        coin.x = clickedCloud.x;
        coin.y = clickedCloud.y;
        coin.scale.set(0.3);
        coin.zIndex = 2;
        coin.anchor.set(0.5);
        coin.label = `coin-${coinCounter}`;
        app.stage.addChild(coin);
        
        // Coin'i diziye ekle
        coins.push(coin);
        
        // Coin oluşturulunca hemen animasyon başlat
        gsap.to(coin, {
            y: container.clientHeight-100,
            duration: 1,
            ease: "power2.inOut"
        });

        return coin;
    }
    // Mushroom karakteri oluşturma fonksiyonu
    const createMushroom = async (x: number, y: number, scale: number = 1): Promise<AnimatedSprite> => {
        // İki animasyon setini yükle
        const idleSheet = await Assets.load("/animatedSprites/mushroom_idle.json");
        const runSheet = await Assets.load("/animatedSprites/mushroom_run.json");
        
        // Idle animasyonuyla başla
        const mushroom = new AnimatedSprite(idleSheet.animations.idle);
        mushroom.x = x;
        mushroom.y = y;
        mushroom.anchor.set(0.5);
        mushroom.scale.set(scale);
        mushroom.animationSpeed = 0.15;
        mushroom.play();
        mushroom.label = 'mushroom';
        mushroom.zIndex = 2;
        app.stage.addChild(mushroom);

        // Hareket durumu
        let isMoving = false;
        const moveSpeed = 5;
        const pressedKeys = new Set<string>();

        // Keyboard kontrolü
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            pressedKeys.add(event.key);
            
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                // Eğer idle animasyondaysa run'a geç
                if (!isMoving) {
                    mushroom.textures = runSheet.animations.run;
                    mushroom.play();
                    isMoving = true;
                }
            }
        });

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            pressedKeys.delete(event.key);
            
            // Hiç ok tuşu basılı değilse idle'a dön
            if (!pressedKeys.has('ArrowRight') && !pressedKeys.has('ArrowLeft')) {
                if (isMoving) {
                    mushroom.textures = idleSheet.animations.idle;
                    mushroom.play();
                    isMoving = false;
                }
            }
        });

        // Her frame'de pozisyonu güncelle
        app.ticker.add(() => {
            if (pressedKeys.has('ArrowRight')) {
                mushroom.x += moveSpeed;
                mushroom.scale.x = -Math.abs(mushroom.scale.x); // Sağa bak
            }
            if (pressedKeys.has('ArrowLeft')) {
                mushroom.x -= moveSpeed;
                mushroom.scale.x = +Math.abs(mushroom.scale.x); // Sola bak (mirror)
            }
            
            // Coin çarpışma kontrolü - her frame'de kontrol et
            for (let i = coins.length - 1; i >= 0; i--) {
                const coin = coins[i];
                // Mutlak mesafeyi hesapla
                const distanceX = Math.abs(mushroom.x - coin.x);
                const distanceY = Math.abs(mushroom.y - coin.y);
                
                // Eğer mantar coin'e yeterince yakınsa, patlat
                if (distanceX < 50 && distanceY < 50) {
                    explodeCoin(coin);
                }
            }
        });

        return mushroom;
    };

    const explodeCoin = (coin: Sprite) => {
        console.log('explodeCoin:', coin.label);
        
        // Coin'i diziden çıkar
        const index = coins.indexOf(coin);
        if (index > -1) {
            coins.splice(index, 1);
        }
        
        // Patlama animasyonu - scale değerini animasyon yap
        const scaleObj = { value: coin.scale.x };
        gsap.to(scaleObj, {
            value: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onUpdate: () => {
                coin.scale.set(scaleObj.value);
            },
            onComplete: () => {
                // Animasyon bitince coin'i stage'den kaldır
                app.stage.removeChild(coin);
                coin.destroy();
            }
        });
    }

    
    // Smiley Face oluşturma fonksiyonu
    const createSmileyFace = async (label: string, x: number, y: number, scale: number = 0.3): Promise<Sprite> => {
        const smileyFace = new Sprite(await Assets.load('/smile-face.png'));
        smileyFace.x = x;
        smileyFace.y = y;
        smileyFace.scale.set(scale);
        smileyFace.zIndex = 2;
        smileyFace.anchor.set(0.5);
        smileyFace.label = label;
        app.stage.addChild(smileyFace);
        return smileyFace;
    };

    // Mushroom karakterini oluştur (ground seviyesinde)
    const mushroom = await createMushroom(
        container.clientWidth / 2, 
        container.clientHeight - (container.clientHeight / 10) - 64, // Ground seviyesinin biraz üstünde
        3 // Scale
    );

    // Önce face'leri oluştur
    const smileyFace1 = await createSmileyFace('smiley-face-1', container.clientWidth/2 -300, container.clientHeight/2 -200, 0.3);
    const smileyFace2 = await createSmileyFace('smiley-face-2', container.clientWidth/2 +200, container.clientHeight/2 -150, 0.3);

    // Cloud oluşturma fonksiyonu - ilgili smiley face'i parametre olarak al
    const createCloud = async (
        label: string, 
        x: number, 
        y: number, 
        smileyFace: Sprite,
        scale: number = 0.5
    ): Promise<Sprite> => {
        
        const cloudTexture = await Assets.load('/cloud.png');
        const cloud = new Sprite(cloudTexture);
        cloud.x = x;
        cloud.y = y;
        cloud.scale.set(scale);
        cloud.zIndex = 1;
        cloud.anchor.set(0.5);
        cloud.eventMode = 'static';
        cloud.cursor = 'pointer';
        cloud.label = label;
        app.stage.addChild(cloud);

        // Her cloud için bir angry face oluştur
        const angryFace = new Sprite(await Assets.load('/angry-face.png'));
        angryFace.x = x;
        angryFace.y = y;
        angryFace.scale.set(0.3);
        angryFace.zIndex = 2;
        angryFace.visible = false;
        angryFace.anchor.set(0.5);
        angryFace.label = `angry-face-${label}`;
        app.stage.addChild(angryFace);

        // Click handler
        function onClick(event: FederatedPointerEvent) {
            console.log('Clicked:', label);
            cloud.eventMode = 'none';
            createCoin(cloud, mushroom);
            
            // Timeline oluştur
            const tl = gsap.timeline({
                onStart: () => {
                    // Animasyon başında: smile gizle, sad göster
                    smileyFace.visible = false;
                    angryFace.visible = true;
                },
                onComplete: () => {
                    // Animasyon bitiminde: sad gizle, smile göster
                    angryFace.visible = false;
                    smileyFace.visible = true;
                }
            });

            // Bulut ve sad face'i aynı anda hareket ettir
            tl.to([cloud, angryFace], {
                x: "+=100", // Mevcut pozisyondan +100
                duration: 0.5,
                ease: "power2.inOut"
            })
            .to([cloud, angryFace], {
                x: "-=120", // Sonra -120 (toplam -20 olur)
                duration: 0.5,
                ease: "power2.inOut"
            })
            .to([cloud, angryFace], {
                x: "+=20", // Başlangıç pozisyonuna dön
                duration: 0.3,
                ease: "power2.inOut"
            }).then(() => cloud.eventMode = 'static');;
            
        }

        cloud.on('pointerdown', onClick);
        return cloud;
    };

    // Sonra cloud'ları oluştur - her cloud'a ilgili smiley face'i geç
    const cloud1 = await createCloud('cloud-1', container.clientWidth/2 -300, container.clientHeight/2 -200, smileyFace1, 0.5);
    const cloud2 = await createCloud('cloud-2', container.clientWidth/2 +200, container.clientHeight/2 -150, smileyFace2, 0.6);

    app.stage.addChild(ground);
    app.stage.addChild(sky);

    // Canvas'ı belirli container'a ekle
    container.appendChild(app.canvas);

}