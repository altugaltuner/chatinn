const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const privategroupsQuery = `
            SELECT *
            FROM chatgroup
            WHERE is_public=false
        `;

    const privategroupsResult = await db.query(privategroupsQuery);

    res.json(privategroupsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı bulunamadı" });
  }
});

module.exports = router;
