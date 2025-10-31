// routes/users.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // PostgreSQL bağlantısı (Pool)

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows); // [{ id: 1, name: ..., email: ... }]
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Veriler alınamadı" });
  }
});

module.exports = router;
