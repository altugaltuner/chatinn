const express = require("express");
const router = express.Router();
const db = require("../db");

// Sign In endpoint
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir" });
    }

    // Kullanıcıyı veritabanından al
    const result = await db.query("SELECT * FROM users WHERE name = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
    }

    // Şifre kontrolü
    if (user.password !== password) {
      return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
    }

    // Başarılı giriş - kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;

    // Son görülme zamanını güncelle
    await db.query(
      "UPDATE users SET last_seen = CURRENT_TIMESTAMP, is_online = true WHERE id = $1",
      [user.id]
    );

    res.json({
      success: true,
      message: "Giriş başarılı",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Sign in error:", err);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu" });
  }
});

// Sign Up endpoint
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
    }

    // Kullanıcı adı zaten var mı kontrol et
    const existingUser = await db.query("SELECT id FROM users WHERE name = $1", [username]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // Yeni kullanıcı oluştur
    const result = await db.query(
      "INSERT INTO users (name, password, created_at, is_online) VALUES ($1, $2, CURRENT_TIMESTAMP, true) RETURNING *",
      [username, password]
    );

    const newUser = result.rows[0];
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Sign up error:", err);
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu" });
  }
});

module.exports = router;
