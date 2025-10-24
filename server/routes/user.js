const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kullanıcı bulunamadı' });
    }
});

module.exports = router;