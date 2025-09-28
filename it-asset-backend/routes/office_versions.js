const express = require("express");
const router = express.Router();
const OfficeVersion = require("../models/OfficeVersion");

// GET ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const data = await OfficeVersion.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST เพิ่มใหม่
router.post("/", async (req, res) => {
  try {
    const item = await OfficeVersion.create({ name: req.body.name });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT อัปเดต
router.put("/:id", async (req, res) => {
  try {
    await OfficeVersion.update(
      { name: req.body.name },
      { where: { id: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ลบ
router.delete("/:id", async (req, res) => {
  try {
    await OfficeVersion.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
