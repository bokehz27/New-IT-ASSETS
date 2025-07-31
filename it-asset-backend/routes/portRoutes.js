// routes/portRoutes.js
const express = require('express');
const router = express.Router();
const { SwitchPort } = require('../models'); // Import Model เข้ามา

/**
 * @route   PUT /api/ports/:portId
 * @desc    อัปเดตข้อมูลของพอร์ตที่ระบุ
 * @access  Private
 */
router.put('/:portId', async (req, res) => {
  try {
    const { portId } = req.params;
    
    // รับข้อมูลจาก request body ที่ Frontend ส่งมา
    const { lanCableId, connectedTo, notes, status, vlan } = req.body;

    // ค้นหาพอร์ตด้วย Primary Key (id)
    const port = await SwitchPort.findByPk(portId);

    // ถ้าไม่พบพอร์ต ส่ง 404 Not Found
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // อัปเดตข้อมูลในแต่ละฟิลด์
    // ใช้ ?? เพื่อให้ค่าเดิมยังคงอยู่ถ้าหากไม่มีการส่งค่าใหม่มา
    port.lanCableId = lanCableId ?? port.lanCableId;
    port.connectedTo = connectedTo ?? port.connectedTo;
    port.notes = notes ?? port.notes;
    port.status = status ?? port.status;
    port.vlan = vlan ?? port.vlan;

    // บันทึกการเปลี่ยนแปลงลงฐานข้อมูล
    await port.save();

    // ส่งข้อมูลพอร์ตที่อัปเดตแล้วกลับไป
    res.json({ message: "Port updated successfully", port });

  } catch (error) {
    console.error("Error updating port:", error);
    res.status(500).json({ message: "Error updating port", error: error.message });
  }
});

module.exports = router;