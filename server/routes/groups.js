const express = require("express");
const router = express.Router();
const db = require("../db");

// tüm grupları al döndür
router.get("/", async (req, res) => {
  try {
    const groupsQuery = `
    SELECT 
        g.*,
        COUNT(cm.user_id) as population
    FROM chatgroup g
    LEFT JOIN chat_members cm ON g.id = cm.chat_group_id
    GROUP BY g.id
`;
    const groupsResult = await db.query(groupsQuery);

    res.json(groupsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Kullanıcı bulunamadı" });
  }
});

router.put("/group_requests/accept/:groupId/:userId", async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    // 1) İsteği accepted yap
    const acceptGroupRequestQuery = `
      UPDATE group_requests 
      SET status = 'accepted' 
      WHERE group_id = $1 AND user_id = $2
    `;
    await db.query(acceptGroupRequestQuery, [groupId, userId]);

    // 2) Üyeyi gruba ekle (varsa tekrar ekleme)
    const insertMemberQuery = `
      INSERT INTO chat_members (user_id, chat_group_id, is_admin, joined_at)
      SELECT $1, $2, false, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM chat_members WHERE user_id = $1 AND chat_group_id = $2
      )
    `;
    await db.query(insertMemberQuery, [userId, groupId]);

    res.status(200).json({ message: "Grup isteği kabul edildi ve üye eklendi", success: true });
  } catch (err) {
    console.error("accept group request error:", err);
    res.status(500).json({ error: "Grup isteği kabul edilemedi" });
  }
});

// ⚠️ ÖNCE spesifik route'lar, SONRA dinamik route'lar! ⚠️
// Kullanıcının admin olduğu gruplara gelen istekleri getir
router.get("/group_requests", async (req, res) => {
  const { user_id } = req.query; // currentUser.id (admin olan kişi)
  
  // Validasyon
  if (!user_id || user_id === 'undefined') {
    return res.status(400).json({ 
      error: "user_id gereklidir",
      message: "Geçersiz istek"
    });
  }
  
  try {
    // 3 tabloyu LEFT JOIN et: group_requests + users + chatgroup
    // Sadece currentUser'ın yarattığı (created_by) gruplara gelen istekleri getir

    // user tablosundan id,name,picture verilerini çek.
    // group_requests tablosundan da id, created_at, user_id, group_id ve status verilerini çek.
    // daha sonra chatgroup tablosundan da id,name,created_by verilerini çekip 
    // Daha sonra bunları tek tabloda joinle birleştir. 
    // daha sonra eğer bu group_reqden gelen group_id, sitedeki currentUserin admin oldugu yani 
    // yarattıgı herhangi bir grubun group_idsiyle örtüşüyorsa 
    // o kişinin bilgilerini groupRequests.map ile render et


    const groupRequestsQuery = `
      SELECT 
        gr.id,
        gr.created_at,
        gr.user_id,
        gr.group_id,
        gr.status,
        u.id as request_user_id,
        u.name as user_name,
        u.picture as user_picture,
        cg.id as chatgroup_id,
        cg.name as group_name,
        cg.created_by
      FROM group_requests gr
      LEFT JOIN users u ON gr.user_id = u.id
      LEFT JOIN chatgroup cg ON gr.group_id = cg.id
      WHERE cg.created_by = $1 
        AND gr.status = 'pending'
        AND gr.user_id IS NOT NULL
        AND gr.group_id IS NOT NULL
      ORDER BY gr.created_at DESC
    `;
    
    console.log(`🔍 Grup istekleri sorgulanıyor (admin user_id: ${user_id})`);
    const groupRequestsResult = await db.query(groupRequestsQuery, [user_id]);
    console.log(`✅ ${groupRequestsResult.rows.length} grup isteği bulundu`);
    res.status(200).json(groupRequestsResult.rows);
  } catch (err) {
    console.error("❌ Group requests error:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      error: "Group requests cant be downloaded", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Grupa katılım durumu kontrolü
router.get("/:group_id/is-member", async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.query; // ✅ GET'te query params kullan
  
  if (!user_id) {
    return res.status(400).json({ error: "user_id gerekli", success: false });
  }
  
  try {
    const checkQuery = `SELECT 1 FROM chat_members WHERE user_id = $1 AND chat_group_id = $2`;
    const checkResult = await db.query(checkQuery, [user_id, group_id]);
    if (checkResult.rowCount > 0) {
      res.status(200).json({ is_member: true, success: true });
    } else {
      res.status(200).json({ is_member: false, success: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Grupa katılım durumu kontrolü yapılamadı" });
  }
});

router.get("/:group_id/members", async (req, res) => {
  const { group_id } = req.params;
  try {
    // chat_members ve users tablolarını JOIN ederek kullanıcı bilgilerini al
    const membersQuery = `
      SELECT 
        cm.user_id,
        cm.chat_group_id,
        cm.is_admin,
        cm.joined_at,
        u.id,
        u.name,
        u.picture,
        u.is_online,
        u.last_seen
      FROM chat_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.chat_group_id = $1
      ORDER BY cm.joined_at DESC
    `;
    const membersResult = await db.query(membersQuery, [group_id]);
    console.log(membersResult.rows, "membersResult");
    res.status(200).json({ members: membersResult.rows, success: true });
  } catch (err) {
    console.error('❌ Members fetch hatası:', err);
    console.error('📍 Hata detayı:', err.message);
    res.status(500).json({ error: "Members fetching failed", details: err.message });
  }
});

// Grup oluşturma
router.post("/", async (req, res) => {
  const { name, description, is_public, created_by } = req.body;
  console.log(name, description, is_public, created_by, "name, description, is_public, created_by");
  
  try {
    // 1. Grubu oluştur
    const insertGroupQuery = `
      INSERT INTO chatgroup (name, description, is_public, created_by, created_at) 
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const insertGroupResult = await db.query(insertGroupQuery, [name, description, is_public, created_by]);
    const newGroup = insertGroupResult.rows[0];
    
    // 2. Grup oluşturan kişiyi otomatik olarak gruba admin olarak ekle
    const addCreatorQuery = `
      INSERT INTO chat_members (user_id, chat_group_id, is_admin, joined_at)
      VALUES ($1, $2, true, NOW())
    `;
    await db.query(addCreatorQuery, [created_by, newGroup.id]);
    
    console.log(`✅ Grup oluşturuldu ve ${created_by} admin olarak eklendi`);
    res.status(201).json({ message: "Grup oluşturuldu", success: true, group: newGroup });
  } catch (err) {
    console.error('❌ Grup oluşturma hatası:', err);
    res.status(500).json({ error: "Grup oluşturulamadı" });
  }
});

// Grupa katılım isteği gönder
router.post("/:group_id/join", async (req, res) => {
  const { group_id } = req.params; // URL'den grup id'sini al
  const { user_id } = req.body;
  console.log(req.body, "req.body");

  console.log("Katılım isteği - user_id:", user_id, "group_id:", group_id);

  // Check if the user is already in the group
  const checkQuery = `
      SELECT 1 FROM chat_members WHERE user_id = $1 AND chat_group_id = $2
    `;
  const checkResult = await db.query(checkQuery, [user_id, group_id]);
  if (checkResult.rowCount > 0) {
    return res.status(409).json({ error: "Kullanıcı zaten bu gruba üye", success: false });
  }


  try {
    // 2 parametre - 2 değer gönder (is_admin zaten default false)
    const insertJoinRequestQuery = `INSERT INTO chat_members (user_id, chat_group_id) VALUES ($1, $2)`;
    await db.query(insertJoinRequestQuery, [user_id, group_id]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Katılım hatası:", err.message);
    res.status(500).json({ error: "Grupa katılım isteği gönderilemedi" });
  }
});

// spesifik bir grup bilgisini al (DİNAMİK ROUTE - EN SONA!)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const groupQuery = `SELECT * FROM chatgroup WHERE id = $1`;
    const groupResult = await db.query(groupQuery, [id]);
    console.log(groupResult.rows[0], "groupResult");
    res.json(groupResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Grup bulunamadı" });
  }
});

module.exports = router;

//dipnot: Sorun: /:group_id/is-member ve /:group_id/members route'ları /:id route'undan SONRA geliyor. Bu durumda:
//Eğer "/123/is-member" gibi bir istek gelirse, Express yanlış route'u eşleştirecek. 
// Dinamik :id route'u bu isteği yakalayacak ve hatalı bir şekilde işleyecek. 
// Doğru sıralama, daha spesifik parametreli route'ların genel dinamik route'dan önce tanımlanması gerektiğini gösteriyor. 
// Bu, daha detaylı ve özel route'ların öncelikli olarak işlenmesini sağlayacaktır.