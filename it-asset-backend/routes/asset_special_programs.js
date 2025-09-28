const express = require("express");
const router = express.Router();
const AssetSpecialProgram = require("../models/assetSpecialProgram");
const Asset = require("../models/Asset");

// GET ทั้งหมด (รวม asset)
router.get("/", async (req, res) => {
  try {
    const data = await AssetSpecialProgram.findAll({ include: Asset });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST เพิ่มใหม่
router.post("/", async (req, res) => {
  try {
    const item = await AssetSpecialProgram.create({
      asset_id: req.body.asset_id,
      program_name: req.body.program_name,
      license_key: req.body.license_key
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT อัปเดต
router.put("/:id", async (req, res) => {
  try {
    await AssetSpecialProgram.update({
      asset_id: req.body.asset_id,
      program_name: req.body.program_name,
      license_key: req.body.license_key
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ลบ
router.delete("/:id", async (req, res) => {
  try {
    await AssetSpecialProgram.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
