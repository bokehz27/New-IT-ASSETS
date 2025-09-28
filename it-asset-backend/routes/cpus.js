const express = require("express");
const router = express.Router();
const Cpu = require("../models/Cpu");

// GET
router.get("/", async (req, res) => {
  try {
    const data = await Cpu.findAll();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST
router.post("/", async (req, res) => {
  try {
    const item = await Cpu.create({ name: req.body.name });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    await Cpu.update({ name: req.body.name }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Cpu.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
