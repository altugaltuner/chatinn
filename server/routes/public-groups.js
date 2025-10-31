const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const publicgroupsQuery = `
            SELECT *
            FROM chatgroup
            WHERE is_public=true
        `;

    const publicgroupsResult = await db.query(publicgroupsQuery);

    res.json(publicgroupsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı bulunamadı" });
  }
});

module.exports = router;
