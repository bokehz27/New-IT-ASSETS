// routes/rackRoutes.js
const express = require("express");
const router = express.Router();
const Rack = require("../models/Rack");
const Switch = require("../models/Switch");
const SwitchPort = require("../models/SwitchPort");

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

// GET next LAN Cable ID สำหรับ Rack นั้น ๆ
router.get("/:rackId/next-lan-id", async (req, res) => {
  try {
    const { rackId } = req.params;

    // ดึง switch ทุกตัวใน rack นี้ พร้อมพอร์ต (เอาเฉพาะ lanCableId ก็พอ)
    const switches = await Switch.findAll({
      where: { rackId },
      include: [
        {
          model: SwitchPort,
          attributes: ["lanCableId"],
        },
      ],
    });

    // ถ้าไม่มี switch เลย ให้เริ่มที่ 1
    if (!switches || switches.length === 0) {
      return res.json({ nextLanId: 1 });
    }

    let maxLanIdNumber = 0;

    switches.forEach((sw) => {
      // Sequelize จะผูกชื่อ association เป็น sw.SwitchPorts
      (sw.SwitchPorts || []).forEach((port) => {
        const raw = port.lanCableId;
        if (!raw) return;

        // ดึงเฉพาะตัวเลขออกมาจากข้อความ (เผื่อมี "8 P-3 3M." แบบในฐานข้อมูล)
        const matches = raw.match(/\d+/g);
        if (!matches) return;

        matches.forEach((part) => {
          const num = parseInt(part, 10);
          if (!isNaN(num) && num > maxLanIdNumber) {
            maxLanIdNumber = num;
          }
        });
      });
    });

    // ถ้าใน rack นี้ยังไม่มีเลขเลย maxLanIdNumber จะยังเป็น 0 → next = 1
    const nextLanId = maxLanIdNumber + 1;

    return res.json({ nextLanId });
  } catch (error) {
    console.error("Error calculating next LAN ID:", error);
    res.status(500).json({
      error: "Failed to calculate next LAN ID",
      details: error.message,
    });
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
