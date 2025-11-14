"use client";

import { Assets, Application, Sprite, Graphics, FederatedPointerEvent, AnimatedSprite, Text, TextStyle, Container } from 'pixi.js';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

// PixiPlugin'i register et (GSAP'in Pixi.js objelerini animasyon yapabilmesi için)
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI({ Application, Sprite, Graphics, Text, Container });

declare global {
    var __PIXI_APP__: Application;
}

export const earthquakeFunction = async () => {
    const container = document.getElementById('earthquake-container');
    if (!container) {
        console.error('earthquake-container bulunamadı!');
        return;
    }

    const app = new Application();

    await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x101828,
        antialias: true,
        resolution: 1,
        preference: 'webgl',
    });

    // Başlık metinleri
    const mainTitle = new Text({
        text: 'Arkadaşlarım',
        style: new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ffffff',
        })
    });
    mainTitle.x = 250;
    mainTitle.y = 50;
    mainTitle.zIndex = 1;
    mainTitle.anchor.set(0.5);
    mainTitle.label = 'mainTitle';
    app.stage.addChild(mainTitle);

    const subTitle = new Text({
        text: '1 Arkadaş bulundu',
        style: new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#90a1b9',
        })
    });
    subTitle.x = 250;
    subTitle.y = 85;
    subTitle.zIndex = 1;
    subTitle.anchor.set(0.5);
    subTitle.label = 'subTitle';
    app.stage.addChild(subTitle);

  

    // Referans resim boyutu ve scale (pic1: 762x762, scale: 0.4)
    const referenceSize = 762;
    const referenceScale = 0.4;
    const targetDisplaySize = referenceSize * referenceScale; // 304.8px

    let profileCardCounter = 0;

    // Profil kartı oluşturma fonksiyonu
    const createProfileCard = async (xOffset: number, username: string, pic: Sprite): Promise<Container> => {
        profileCardCounter++;

        // Container oluştur
        const cardContainer = new Container();
        cardContainer.x = xOffset;
        cardContainer.label = 'profileCard' + profileCardCounter;
        cardContainer.eventMode = 'static'; // Event'leri dinlemek için gerekli
        cardContainer.cursor = 'pointer'; // İmleç değişimi için

        // Kullanıcı adı metni
        const usernameText = new Text({
            text: username,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: '#ffffff',
            })
        });
        usernameText.x = 170;
        usernameText.y = 450;
        usernameText.zIndex = 5;
        usernameText.anchor.set(0.5);
        usernameText.label = 'username' + profileCardCounter;
        cardContainer.addChild(usernameText);
        
        // Child'lara erişim için property olarak ekle
        (cardContainer as any).usernameText = usernameText;

        // Profil resmi
        const picSprite = new Sprite(pic.texture);
        const picWidth = pic.texture.width;
        const calculatedScale = targetDisplaySize / picWidth;

        picSprite.x = 250;
        picSprite.y = container.clientHeight / 2 - 100;
        picSprite.scale.set(calculatedScale);
        picSprite.zIndex = 2;
        picSprite.anchor.set(0.5);
        picSprite.label = 'pic' + profileCardCounter;
        cardContainer.addChild(picSprite);

        // Profil logo
        const profileLogo = new Sprite(await Assets.load('/profile-logo.png'));
        profileLogo.x = 360;
        profileLogo.y = 490;
        profileLogo.scale.set(1);
        profileLogo.zIndex = 5;
        profileLogo.anchor.set(0.5);
        profileLogo.label = 'profileLogo' + profileCardCounter;
        cardContainer.addChild(profileLogo);

        // Mesaj butonu
        const messageBtn = new Sprite(await Assets.load('/message-btn.png'));
        messageBtn.x = 220;
        messageBtn.y = 490;
        messageBtn.scale.set(1);
        messageBtn.zIndex = 4;
        messageBtn.anchor.set(0.5);
        messageBtn.label = 'messageBtn' + profileCardCounter;
        cardContainer.addChild(messageBtn);

        // Alt dikdörtgen
        const downRectangle = new Graphics();
        downRectangle.rect(95, 420, 310, 100);
        downRectangle.fill({ color: 0x1e2939, alpha: 1 });
        downRectangle.zIndex = 1;
        downRectangle.label = 'downRectangle' + profileCardCounter;
        cardContainer.addChild(downRectangle);

        app.stage.addChild(cardContainer);
        return cardContainer;
    };

    // 3 profil kartı oluştur (her biri arasında 400px x ekseni mesafesi)
    const profileCard1 = await createProfileCard(0, "Altuğ Altuner", new Sprite(await Assets.load('/pic1.png')));
    const profileCard2 = await createProfileCard(400, "Melike Çelik", new Sprite(await Assets.load('/pic2.jpg')));
    const profileCard3 = await createProfileCard(800, "Ahmet Yılmaz", new Sprite(await Assets.load('/pic3.jpg')));

    // Event listener'lar
    const startEarthquake = () => {
        console.log('startEarthquake');

        // Timeline oluştur
        const tl = gsap.timeline({
            onStart: () => {
                console.log('startEarthquake');
            },
            onComplete: () => {
                console.log('completeEarthquake');
            },
        });


        const usernameText = (profileCard1 as any).usernameText;
        usernameText.anchor.set(0, 0);

        tl.to(usernameText, {
            pixi: {
                anchorX: 0,
                anchorY: 0,
                rotation: 50 // radyan cinsinden (3 radyan ≈ 172 derece)
            },
            duration: 1,
            ease: "power2.inOut"
        });

    };

    profileCard1.on('pointerdown', () => {
        console.log('pointerdownasasasasasa');
        startEarthquake();
    });

    globalThis.__PIXI_APP__ = app;
    container.appendChild(app.canvas);
};
