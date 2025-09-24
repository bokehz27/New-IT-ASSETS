// routes/switchRoutes.js
const express = require("express");
const router = express.Router(); // <-- ปัญหาน่าจะเกิดจากบรรทัดนี้หายไป
const { Op } = require("sequelize");
const Switch = require("../models/Switch");
const Rack = require("../models/Rack");
const SwitchPort = require("../models/SwitchPort");

// GET all switches (can filter by rackId for 'unassigned')
router.get("/", async (req, res) => {
  try {
    const { rackId } = req.query;
    const whereClause = {};

    if (rackId === "null") {
      whereClause.rackId = { [Op.is]: null };
    } else if (rackId) {
      whereClause.rackId = rackId;
    }

    const switches = await Switch.findAll({
      where: whereClause,
      include: [Rack],
    });
    res.json(switches);
  } catch (error) {
    console.error("Error fetching switches:", error);
    res.status(500).json({ error: "Failed to fetch switches" });
  }
});

// GET a single switch by ID
router.get("/:id", async (req, res) => {
  try {
    const sw = await Switch.findByPk(req.params.id);
    if (sw) {
      res.json(sw);
    } else {
      res.status(404).json({ error: "Switch not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch switch" });
  }
});

// GET all ports for a specific switch
router.get("/:switchId/ports", async (req, res) => {
  try {
    const ports = await SwitchPort.findAll({
      where: { switchId: req.params.switchId },
      order: [["portNumber", "ASC"]],
    });
    res.json(ports);
  } catch (error) {
    console.error("ERROR FETCHING PORTS:", error);
    res.status(500).json({
      message: "Failed to fetch ports for switch",
      error_details: error.toString(),
      error_object: error,
    });
  }
});

// POST a new switch
router.post("/", async (req, res) => {
  try {
    const newSwitch = await Switch.create(req.body);

    const portCount = parseInt(req.body.port_count, 10) || 0;

    if (portCount > 0) {
      const portsToCreate = [];
      for (let i = 1; i <= portCount; i++) {
        portsToCreate.push({
          portNumber: i,
          switchId: newSwitch.id,
          status: "Disabled",
        });
      }
      await SwitchPort.bulkCreate(portsToCreate);
    }

    res.status(201).json(newSwitch);
  } catch (error) {
    console.error("Error creating switch:", error);
    res.status(400).json({ error: "Failed to create switch" });
  }
});

//... (โค้ด GET และ POST เดิม)

// PUT (Update) a switch by ID
router.put("/:id", async (req, res) => {
  try {
    const sw = await Switch.findByPk(req.params.id);
    if (sw) {
      await sw.update(req.body);
      res.json(sw);
    } else {
      res.status(404).json({ error: "Switch not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Failed to update switch" });
  }
});

// DELETE a switch by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Switch.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Switch not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete switch" });
  }
});

module.exports = router;

module.exports = router;
