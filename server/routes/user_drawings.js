const express = require("express");
const router = express.Router();
const db = require("../db");

// Kullanıcı çizimini kaydet
router.post("/", async (req, res) => {
    const { title, labels, description, url, user_id } = req.body;
    
    console.log("📝 Gelen çizim verisi:", {
      title,
      labels: labels?.substring(0, 50),
      description: description?.substring(0, 50),
      url: url?.substring(0, 50) + "...",
      user_id
    });

    try {
      const insertQuery = `
        INSERT INTO user_drawings (title, labels, description, url, user_id, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, title, created_at
      `;
      const result = await db.query(insertQuery, [title, labels, description, url, user_id]);
      
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
      SELECT id, title, labels, description, url, created_at 
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
      SELECT id, title, labels, description, url, created_at 
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