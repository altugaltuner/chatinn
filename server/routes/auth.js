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

router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    if (!currentPassword || !newPassword || !userId) {
      return res.status(400).json({ error: "Tüm alanlar gereklidir" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır" });
    }

    // Kullanıcıyı veritabanından al
    const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    console.log(user, "user");
    console.log(result, "result");
    // Result {
    //   command: 'SELECT',
    //   rowCount: 1,
    //   oid: null,
    //   rows: [
    //     {
    //       id: 8,
    //       name: 'altug',
    //       password: 'alalalal',
    //       picture: null,
    //       created_at: 2025-10-29T19:37:06.121Z,
    //       last_seen: 2025-11-05T13:23:37.367Z,
    //       is_online: true,
    //       bio: 'uıı8888'
    //     }
    //   ],
    //   fields: [
    //     Field {
    //       name: 'id',
    //       tableID: 16582,
    //       columnID: 1,
    //       dataTypeID: 23,
    //       dataTypeSize: 4,
    //       dataTypeModifier: -1,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'name',
    //       tableID: 16582,
    //       columnID: 2,
    //       dataTypeID: 1043,
    //       dataTypeSize: -1,
    //       dataTypeModifier: 259,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'password',
    //       tableID: 16582,
    //       columnID: 3,
    //       dataTypeID: 1043,
    //       dataTypeSize: -1,
    //       dataTypeModifier: 259,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'picture',
    //       tableID: 16582,
    //       columnID: 4,
    //       dataTypeID: 1043,
    //       dataTypeSize: -1,
    //       dataTypeModifier: 504,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'created_at',
    //       tableID: 16582,
    //       columnID: 5,
    //       dataTypeID: 1114,
    //       dataTypeSize: 8,
    //       dataTypeModifier: -1,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'last_seen',
    //       tableID: 16582,
    //       columnID: 6,
    //       dataTypeID: 1114,
    //       dataTypeSize: 8,
    //       dataTypeModifier: -1,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'is_online',
    //       tableID: 16582,
    //       columnID: 7,
    //       dataTypeID: 16,
    //       dataTypeSize: 1,
    //       dataTypeModifier: -1,
    //       format: 'text'
    //     },
    //     Field {
    //       name: 'bio',
    //       tableID: 16582,
    //       columnID: 8,
    //       dataTypeID: 25,
    //       dataTypeSize: -1,
    //       dataTypeModifier: -1,
    //       format: 'text'
    //     }
    //   ],
    //   _parsers: [
    //     [Function: parseInteger],
    //     [Function: noParse],
    //     [Function: noParse],
    //     [Function: noParse],
    //     [Function: parseDate],
    //     [Function: parseDate],
    //     [Function: parseBool],
    //     [Function: noParse]
    //   ],
    //   _types: TypeOverrides {
    //     _types: {
    //       getTypeParser: [Function: getTypeParser],
    //       setTypeParser: [Function: setTypeParser],
    //       arrayParser: [Object],
    //       builtins: [Object]
    //     },
    //     text: {},
    //     binary: {}
    //   },
    //   RowCtor: null,
    //   rowAsArray: false,
    //   _prebuiltEmptyResultObject: {
    //     id: null,
    //     name: null,
    //     password: null,
    //     picture: null,
    //     created_at: null,
    //     last_seen: null,
    //     is_online: null,
    //     bio: null
    //   }
    // } result
    

    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    // Mevcut şifre kontrolü
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: "Mevcut şifre hatalı" });
    }

    // Yeni şifreyi güncelle
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [newPassword, userId]);

    res.json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Şifre değiştirme sırasında bir hata oluştu" });
  }
});
module.exports = router;
