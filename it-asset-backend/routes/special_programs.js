// routes/special_programs.js
const express = require("express");
const router = express.Router();
const SpecialProgram = require("../models/SpecialProgram");

// GET all
router.get("/", async (req, res) => {
  const programs = await SpecialProgram.findAll({ order: [['name', 'ASC']] });
  res.json(programs);
});

// POST (Create)
router.post("/", async (req, res) => {
  try {
    const newProgram = await SpecialProgram.create(req.body);
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT (Update)
router.put("/:id", async (req, res) => {
  try {
    const program = await SpecialProgram.findByPk(req.params.id);
    if (program) {
      await program.update(req.body);
      res.json(program);
    } else {
      res.status(404).json({ error: "Program not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const program = await SpecialProgram.findByPk(req.params.id);
  if (program) {
    await program.destroy();
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Program not found" });
  }
});

module.exports = router;