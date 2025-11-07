const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/profiles");
    // Klasör yoksa oluştur
    try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
   // cb'yi çağırdığımızda Multer'a şunu söylüyoruz:
  // "Hey Multer, dosyayı bu klasöre kaydet!"
  cb(null, uploadDir);
} catch (error) {
  cb(error,null); //ilki hata objesi, ikinci de yol objesi. önce hatayı yazıyoruz çünkü 
  // Bu Node.js'in Error-First Callback standardıdır!
    }
  },

  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur: user-{userId}-{timestamp}.{uzantı}
    const uniqueName = `user-${req.params.id || "temp"}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Dosya filtreleme (sadece resim dosyaları)
const fileFilter = (req, file, cb) => {
  // /regex/  ← İki slash arasına yazılır. "foto.jpeg"  ✅ İçinde "jpeg" var
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // mimetype daha kapsamlı bir kontrol yapıyor. gerçek dosya tipini kontrol eder.
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanıcı bilgilerini al
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = userResult.rows[0];
    console.log(user, "userrrrrr");

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Kullanıcının üye olduğu grupları ve grup üye sayılarını al
    //Peki Sadece cg.id Yazsaydık?
    //❌ HATA ALIRSIN! Kısa Cevap
    // SQL Kuralı: SELECT'te yazdığın her sütun, ya GROUP BY'da olmalı ya da aggregate fonksiyon (COUNT, SUM...) içinde olmalı.
    //Neden? SQL şunu diyor:
    // "SELECT'te cg.name kullanmışsın"
    // "Ama GROUP BY'da yok"
    // "Bu sütunu nasıl göstereyim bilmiyorum!"
    //name i silsek sadece id ile de grouplayıp aynı grup idlerine sahip
    //olanları birleştirip counti da alabiliriz ama bu kez de selecte yazamayacagımız için grup isimlerini front endde gösteremeyiz.
    const groupsQuery = `
            SELECT 
                cg.id,
                cg.name,
                COUNT(cm.user_id) as member_count
            FROM chat_members cm
            JOIN chatgroup cg ON cm.chat_group_id = cg.id
            WHERE cm.user_id = $1
            GROUP BY cg.id, cg.name
            ORDER BY cg.name
        `;

    const groupsResult = await db.query(groupsQuery, [id]);

    // Kullanıcı verisine grupları ekle
    user.groups = groupsResult.rows;

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı bulunamadı" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;
    await db.query("UPDATE users SET bio = $1 WHERE id = $2 RETURNING *", [bio, id]);
    res.json({ success: true, message: "Bio başarıyla güncellendi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Hakkında kaydedilirken hata" });
  }
});

// Profil fotoğrafı yükleme endpoint'i
router.post("/:id/upload-picture", upload.single("picture"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, error: "Dosya yüklenmedi" });
    }

    // Eski profil fotoğrafını sil (eğer varsa ve default değilse)
    const oldPicture = await db.query("SELECT picture FROM users WHERE id = $1", [id]);
    if (oldPicture.rows[0]?.picture && !oldPicture.rows[0].picture.includes("defaultpp.jpg")) {
      const oldPath = path.join(__dirname, "../../public", oldPicture.rows[0].picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Yeni fotoğrafın URL'ini oluştur
    const pictureUrl = `/uploads/profiles/${req.file.filename}`;

    // Veritabanını güncelle
    const result = await db.query(
      "UPDATE users SET picture = $1 WHERE id = $2 RETURNING *",
      [pictureUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Kullanıcı bulunamadı" });
    }

    res.json({
      success: true,
      message: "Profil fotoğrafı başarıyla güncellendi",
      picture: pictureUrl,
    });
  } catch (err) {
    console.error("Profil fotoğrafı yükleme hatası:", err);
    res.status(500).json({ success: false, error: "Profil fotoğrafı yüklenirken hata oluştu" });
  }
});

module.exports = router;
