// routes/portRoutes.js
const express = require('express');
const router = express.Router();
const SwitchPort = require('../models/SwitchPort');

/**
 * @route   PUT /api/ports/:portId
 * @desc    อัปเดตข้อมูลของพอร์ตที่ระบุ
 * @access  Private
 */
router.put('/:portId', async (req, res) => {
  try {
    const { portId } = req.params;
    
    // 1. ลบ connectedTo ออกจากการรับข้อมูล
    const { lanCableId, notes, status, vlan } = req.body;

    const port = await SwitchPort.findByPk(portId);

    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // 2. ลบบรรทัดที่อัปเดต port.connectedTo
    port.lanCableId = lanCableId ?? port.lanCableId;
    port.notes = notes ?? port.notes;
    port.status = status ?? port.status;
    port.vlan = vlan ?? port.vlan;

    await port.save();

    res.json({ message: "Port updated successfully", port });

  } catch (error) {
    console.error("Error updating port:", error);
    res.status(500).json({ message: "Error updating port", error: error.message });
  }
});

module.exports = router;