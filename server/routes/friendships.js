const express = require('express');
const router = express.Router();
const db = require('../db');

// Arkadaşlık isteği gönder
router.post('/', async (req, res) => {
  const { user_id, friend_id, status } = req.body;

  // Validasyon
  if (!user_id || !friend_id) {
    return res.status(400).json({ 
      error: 'user_id ve friend_id gereklidir',
      message: 'Geçersiz istek' 
    });
  }

  // Kendine istek göndermeyi engelle
  if (user_id === friend_id) {
    return res.status(400).json({ 
      error: 'Kendinize arkadaşlık isteği gönderemezsiniz',
      message: 'Geçersiz işlem' 
    });
  }

  try {
    // Zaten arkadaşlık isteği var mı kontrol et (PostgreSQL syntax)
    const checkQuery = `
      SELECT * FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) 
         OR (user_id = $2 AND friend_id = $1)
    `;
    
    const existingFriendship = await db.query(checkQuery, [user_id, friend_id]);

    if (existingFriendship.rows && existingFriendship.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Zaten bir arkadaşlık isteği mevcut',
        message: 'Bu kullanıcıya zaten istek gönderilmiş' 
      });
    }

    // Yeni arkadaşlık isteği ekle (PostgreSQL syntax)
    const insertQuery = `
      INSERT INTO friendships (user_id, friend_id, status, created_at) 
      VALUES ($1, $2, $3, NOW())
    `;

    await db.query(insertQuery, [user_id, friend_id, status || 'pending']);

    res.status(201).json({ 
      message: 'Arkadaşlık isteği başarıyla gönderildi',
      success: true 
    });

  } catch (error) {
    console.error('Arkadaşlık isteği hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası',
      message: 'Arkadaşlık isteği gönderilemedi' 
    });
  }
});

// Tüm arkadaşlık isteklerini getir
router.get('/all', async (req, res) => {
  try {
    const query = `
      SELECT 
        f.*,
        u1.name as user_name,
        u1.picture as user_picture,
        u2.name as friend_name,
        u2.picture as friend_picture
      FROM friendships f
      JOIN users u1 ON f.user_id = u1.id
      JOIN users u2 ON f.friend_id = u2.id
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Tüm arkadaşlıkları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli iki kullanıcı arasındaki arkadaşlık durumunu kontrol et
router.get('/status/:user_id/:friend_id', async (req, res) => {
  const { user_id, friend_id } = req.params; // ✅ Burayı ekledim!
  
  try {
    const query = `
      SELECT * FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) 
         OR (user_id = $2 AND friend_id = $1)
    `;
    const result = await db.query(query, [user_id, friend_id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Tek bir sonuç dön
    } else {
      res.json({ status: 'none' }); // Arkadaşlık yok
    }
  } catch (error) {
    console.error('Arkadaşlık durumu kontrol hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir kullanıcının tüm arkadaşlık isteklerini getir (gelen istekler)
router.get('/requests/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = `
      SELECT 
        f.*,
        u.name as sender_name,
        u.picture as sender_picture
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Arkadaşlık isteklerini getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir kullanıcının arkadaşlarını listele
router.get('/friends/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.picture
      FROM users u
      WHERE u.id IN (
        SELECT friend_id FROM friendships 
        WHERE user_id = $1 AND status = 'accepted'
        UNION
        SELECT user_id FROM friendships 
        WHERE friend_id = $1 AND status = 'accepted'
      )
      ORDER BY u.name
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Arkadaşları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaşlık isteğini kabul et veya reddet
router.put('/:friendshipId', async (req, res) => {
  const { friendshipId } = req.params;
  const { status } = req.body; // 'accepted' veya 'rejected'

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ 
      error: 'Geçersiz durum',
      message: 'Status accepted veya rejected olmalıdır' 
    });
  }

  try {
    const updateQuery = `
      UPDATE friendships 
      SET status = $1 
      WHERE id = $2
    `;
    await db.query(updateQuery, [status, friendshipId]);

    res.json({ 
      message: `Arkadaşlık isteği ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`,
      success: true 
    });
  } catch (error) {
    console.error('Arkadaşlık durumu güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir kullanıcının arkadaşlarını listele (sadece onaylananlar)
router.get('/myfriends/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.picture
      FROM users u
      WHERE u.id IN (
        SELECT friend_id FROM friendships 
        WHERE user_id = $1 AND status = 'accepted'
        UNION
        SELECT user_id FROM friendships 
        WHERE friend_id = $1 AND status = 'accepted'
      )
      ORDER BY u.name
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  }
  catch (error) {
    console.error('Arkadaşları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;

