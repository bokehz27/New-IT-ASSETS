// routes/vlans.js

const express = require("express");
const router = express.Router();
const { Vlan } = require("../models"); // Import จาก index.js

// GET all vlans
router.get("/", async (req, res) => {
  try {
    const vlans = await Vlan.findAll({ order: [["name", "ASC"]] });
    res.json(vlans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vlans" });
  }
});

// POST a new vlan
router.post("/", async (req, res) => {
  try {
    const vlan = await Vlan.create(req.body);
    res.status(201).json(vlan);
  } catch (error) {
    res.status(400).json({ error: "Failed to create vlan" });
  }
});

// PUT (update) a vlan
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Vlan.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedVlan = await Vlan.findByPk(req.params.id);
      res.status(200).json(updatedVlan);
    } else {
      res.status(404).json({ error: "Vlan not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Failed to update vlan" });
  }
});

// DELETE a vlan
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vlan.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Vlan not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vlan" });
  }
});

module.exports = router;