const express = require("express");
const router = express.Router();
const AssetStatus = require("../models/AssetStatus");

// GET ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const statuses = await AssetStatus.findAll();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ตาม id
router.get("/:id", async (req, res) => {
  try {
    const status = await AssetStatus.findByPk(req.params.id);
    if (!status) return res.status(404).json({ error: "Not found" });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST สร้างใหม่
router.post("/", async (req, res) => {
  try {
    const status = await AssetStatus.create(req.body);
    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT อัปเดต
router.put("/:id", async (req, res) => {
  try {
    const status = await AssetStatus.findByPk(req.params.id);
    if (!status) return res.status(404).json({ error: "Not found" });
    await status.update(req.body);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ลบ
router.delete("/:id", async (req, res) => {
  try {
    const status = await AssetStatus.findByPk(req.params.id);
    if (!status) return res.status(404).json({ error: "Not found" });
    await status.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
