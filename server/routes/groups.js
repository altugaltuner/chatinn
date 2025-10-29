const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
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
        res.status(500).json({ error: 'Kullanıcı bulunamadı' });
    }
});

module.exports = router;