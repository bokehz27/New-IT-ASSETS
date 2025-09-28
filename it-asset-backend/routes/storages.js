const express = require("express");
const router = express.Router();
const Storage = require("../models/Storage");

// GET
router.get("/", async (req, res) => {
  try {
    const data = await Storage.findAll();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST
router.post("/", async (req, res) => {
  try {
    const item = await Storage.create({ size: req.body.size });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    await Storage.update({ size: req.body.size }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Storage.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
