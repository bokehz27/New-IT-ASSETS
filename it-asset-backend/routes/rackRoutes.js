// routes/rackRoutes.js
const express = require("express");
const router = express.Router();
const Rack = require("../models/Rack");
const Switch = require("../models/Switch");

router.get("/", async (req, res) => {
  try {
    const racks = await Rack.findAll({
      include: [Switch],
      // --- อัปเดตตรงนี้ ---
      // 1. เรียงตาม Location ก่อน
      // 2. ถ้า Location เดียวกัน ให้เรียงตามชื่อ Rack
      order: [
        ["location", "ASC"],
        ["name", "ASC"],
      ],
    });
    res.json(racks);
  } catch (error) {
    console.error("Error fetching racks:", error);
    res.status(500).json({ error: "Failed to fetch racks" });
  }
});

// POST a new rack
router.post("/", async (req, res) => {
  try {
    const { name, location } = req.body;
    const newRack = await Rack.create({ name, location });
    res.status(201).json(newRack);
  } catch (error) {
    console.error("Error creating rack:", error);
    res.status(400).json({ error: "Failed to create rack" });
  }
});

// DELETE a rack
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Rack.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Rack not found" });
    }
  } catch (error) {
    console.error("Error deleting rack:", error);
    res.status(500).json({ error: "Failed to delete rack" });
  }
});

// EDIT a rack
router.put("/:id", async (req, res) => {
  try {
    const { name, location } = req.body;
    const rack = await Rack.findByPk(req.params.id);
    if (rack) {
      rack.name = name;
      rack.location = location;
      await rack.save();
      res.json(rack);
    } else {
      res.status(404).json({ error: "Rack not found" });
    }
  } catch (error) {
    console.error("Error updating rack:", error);
    res.status(400).json({ error: "Failed to update rack" });
  }
});

module.exports = router;
