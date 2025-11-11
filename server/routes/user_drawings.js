const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");
const path = require("path");

// uploads klasörünü oluştur (yoksa)
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 uploads klasörü oluşturuldu");
}

// Kullanıcı çizimini kaydet
router.post("/", async (req, res) => {
    const { title, labels, description, imageData, user_id } = req.body;
    
    console.log("📝 Gelen çizim verisi:", {
      title,
      labels: labels?.substring(0, 50),
      description: description?.substring(0, 50),
      imageData: imageData?.substring(0, 50) + "...",
      imageDataLength: imageData?.length,
      user_id
    });

    try {
      // Base64 stringi dosyaya kaydet
      if (!imageData || !imageData.startsWith("data:image/png;base64,")) {
        console.error("❌ Geçersiz resim verisi başlangıcı:", imageData?.substring(0, 100));
        throw new Error("Geçersiz resim verisi");
      }

      // Base64'ü binary'ye çevir
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      console.log("📊 Base64 veri uzunluğu:", base64Data.length);
      
      const fileName = `drawing_${user_id}_${Date.now()}.png`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Dosyayı kaydet
      fs.writeFileSync(filePath, base64Data, "base64");
      const fileSize = fs.statSync(filePath).size;
      console.log("💾 Dosya kaydedildi:", fileName, `(${fileSize} bytes)`);

      // URL'i oluştur (frontend'den erişilebilir)
      const fileUrl = `/uploads/${fileName}`;

      const insertQuery = `
        INSERT INTO user_drawings (title, labels, description, url, user_id, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, title, url, created_at
      `;
      const result = await db.query(insertQuery, [title, labels, description, fileUrl, user_id]);
      
      console.log("✅ Çizim veritabanına kaydedildi:", result.rows[0]);
      
      res.json({ 
        message: "Çizim başarıyla kaydedildi", 
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error("❌ Çizim kaydetme hatası:", error);
      res.status(500).json({ 
        error: "Sunucu hatası", 
        details: error.message,
        success: false 
      });
    }
  });

// Kullanıcının tüm çizimlerini getir
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const query = `
      SELECT id, title, labels,user_id, description, url, created_at 
      FROM user_drawings 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    
    res.json({ 
      success: true,
      drawings: result.rows 
    });
  } catch (error) {
    console.error("❌ Çizimleri getirme hatası:", error);
    res.status(500).json({ 
      error: "Sunucu hatası",
      success: false 
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT id, title, labels, description, url, created_at, user_id, likes
      FROM user_drawings 
      ORDER BY created_at DESC
    `;
  const result = await db.query(query);
  res.json({
    success: true,
    data: result.rows
  });
  } catch (error) {
    console.error("❌ Çizimleri getirme hatası:", error);
    res.status(500).json({
      error: "Sunucu hatası",
      success: false
    });
  }
});

module.exports = router;