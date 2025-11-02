const express = require('express');
const router = express.Router();
const db = require('../db');


/**
 * Verilen roomId string'inden oda tipini ve ilgili kullanıcı ID'lerini çıkartır.
 * Örneğin:
 *   - Eğer roomId "dm_1_5" ise, bu fonksiyon şunu döner:
 *     { type: 'dm', userId1: 1, userId2: 5 }
 *   - Eğer roomId beklenen formatta değilse, null döner.
 * 
 * Açıklamalar:
 * - startsWith('dm_') kontrolü, stringin birebir (direct message) oda olduğunu belirler.
 * - 'dm_' ön eki çıkartıldıktan sonra kalan kısmı '_' ile böleriz.
 *   Örn: "dm_1_5" -> ['1', '5']
 * - parseInt ile kullanıcı ID'lerini integer'a çeviririz.
 * - Başka türde (ör: grup) oda eklemek gerekirse burası genişletilebilir.
 */
function parseRoomId(roomId) {
  if (roomId.startsWith('dm_')) {
    // "dm_" ile başlayanları ele al
    const parts = roomId.replace('dm_', '').split('_'); // ["1", "5"]
    return {
      type: 'dm',                           // oda tipi
      userId1: parseInt(parts[0]),          // ilk kullanıcı ID'si
      userId2: parseInt(parts[1])           // ikinci kullanıcı ID'si
    };
  }
  // Beklenen formata uymayan roomId'lerde null dön
  return null;
}

// Mesaj gönder (POST /api/messages)
router.post('/', async (req, res) => {
  try {
    const { roomId, senderId, message } = req.body;

    if (!roomId || !senderId || !message) {
      return res.status(400).json({ error: 'roomId, senderId ve message gerekli' });
    }

    const roomInfo = parseRoomId(roomId);
    if (!roomInfo) {
      return res.status(400).json({ error: 'Geçersiz roomId formatı' });
    }

    // Birebir mesaj
    const receiverId = roomInfo.userId1 === senderId ? roomInfo.userId2 : roomInfo.userId1;
    const result = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
      [senderId, receiverId, message]
    );

    res.status(201).json({
      success: true,
      message: result.rows[0]
    });
  } catch (err) {
    console.error('Mesaj gönderme hatası:', err);
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

// Belirli bir room'un mesajlarını getir (GET /api/messages/:roomId)
//http://localhost:3001/api/messages/dm_1_8
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const roomInfo = parseRoomId(roomId);
    if (!roomInfo) {
      return res.status(400).json({ error: 'Geçersiz roomId formatı' });
    }

    // Birebir mesajları getir dm_1_8 bunu parçaladıktan sonra userId1 ve userId2 alıyoruz. userId1 ve userId2'yi sender_id ve receiver_id olarak kullanarak mesajları getiriyoruz.
    const result = await db.query(
      `SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.created_at,
        m.is_read,
        u.name as sender_name,
        u.picture as sender_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
      LIMIT $3 OFFSET $4`,
      [roomInfo.userId1, roomInfo.userId2, limit, offset]
    );

    res.json({
      success: true,
      messages: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Mesajları getirme hatası:', err);
    res.status(500).json({ error: 'Mesajlar getirilemedi' });
  }
});

// Kullanıcının mesajlaştığı kişilerin listesini getir (GET /api/messages/conversations/:userId)
router.get('/conversations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId gerekli' });
    }

    // Kullanıcının mesajlaştığı kişileri ve son mesajları getir

    // JavaScript ile yazarsak:
    // const other_user_id = (message.sender_id === currentUserId) 
    // ? message.receiver_id  // Sen gönderdiysen → alıcı karşı taraf
    // : message.sender_id;   // Sana gönderdiyse → gönderen karşı taraf
    const result = await db.query(
      `SELECT DISTINCT ON (other_user_id) 
      -- Her kişiye ait son mesajı al (çakışan mesajları birleştir)
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id  -- Eğer sen gönderdiysen -> alıcıyı al
          ELSE m.sender_id  -- Eğer sen alıcı değilsen -> göndericiyı al
        END as other_user_id,
        u.name as name,
        u.picture,
        m.message as last_message,
        m.created_at as last_message_time,
        (SELECT COUNT(*) 
        --Karşı tarafın sana gönderdiği ve henüz okumadığın mesaj sayısı.

         FROM messages 
         WHERE receiver_id = $1  
         --Sadece senin dahil olduğun mesajları getir (gönderdiğin VEYA aldığın).

         AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
         AND is_read = false) as unread_count
      FROM messages m
      JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) = u.id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY other_user_id, m.created_at DESC`,
      [userId]
    );
    //Sorgu şunu döndürür:

    //[
    // { other_user_id: 5, name: "Ahmet", last_message: "Selam", unread_count: 2 },
    // { other_user_id: 7, name: "Ayşe", last_message: "Nasılsın?", unread_count: 0 },
    // { other_user_id: 9, name: "Mehmet", last_message: "İyi akşamlar", unread_count: 1 }
    // ]

    // Sonuçları formatla
    const conversations = result.rows.map(row => ({
      id: row.other_user_id.toString(),
      name: row.name,
      picture: row.picture,
      lastMessage: row.last_message,
      time: row.last_message_time,
      unread: parseInt(row.unread_count) || 0
    }));

    res.json({
      success: true,
      conversations
    });
  } catch (err) {
    console.error('Konuşmaları getirme hatası:', err);
    res.status(500).json({ error: 'Konuşmalar getirilemedi' });
  }
});

module.exports = router;

