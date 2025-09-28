const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// GET ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const data = await Department.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST เพิ่มใหม่
router.post("/", async (req, res) => {
  try {
    const item = await Department.create({ name: req.body.name });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT อัปเดต
router.put("/:id", async (req, res) => {
  try {
    await Department.update(
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
    await Department.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
