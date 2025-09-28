const express = require("express");
const router = express.Router();
const Ram = require("../models/Ram");

// GET
router.get("/", async (req, res) => {
  try {
    const data = await Ram.findAll();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST
router.post("/", async (req, res) => {
  try {
    const item = await Ram.create({ size: req.body.size });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    await Ram.update({ size: req.body.size }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Ram.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
