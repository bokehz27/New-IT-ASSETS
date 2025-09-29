// routes/vlans.js
const express = require("express");
const router = express.Router();
const Vlan = require("../models/Vlan"); // ตรวจสอบให้แน่ใจว่า path ไปยัง model ถูกต้อง

router.get("/", async (req, res) => {
  try {
    const vlans = await Vlan.findAll({ order: [["name", "ASC"]] });
    res.json(vlans);
  } catch (error) {
    console.error("Error fetching vlans:", error);
    res.status(500).json({ error: "Failed to fetch vlans" });
  }
});

module.exports = router;