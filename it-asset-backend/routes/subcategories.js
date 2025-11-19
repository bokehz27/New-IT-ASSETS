const express = require("express");
const router = express.Router();
const Subcategory = require("../models/Subcategory");

// GET all
router.get("/", async (req, res) => {
  try {
    // ❌ ไม่ต้อง include Category แล้ว
    const data = await Subcategory.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const item = await Subcategory.create({
      name: req.body.name,
      // ❌ category_id ถูกลบแล้ว
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    await Subcategory.update(
      {
        name: req.body.name,
        // ❌ category_id ถูกลบแล้ว
      },
      { where: { id: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Subcategory.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
