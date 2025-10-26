const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Kullanıcı bilgilerini al
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];
        console.log(user, "userrrrrr");

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
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
        res.status(500).json({ error: 'Kullanıcı bulunamadı' });
    }
});

module.exports = router;