// routes/asset_special_programs.js (Final)

const express = require('express');
const router = express.Router();
// เราจะใช้ Model จากไฟล์กลางที่เราสร้างไว้
const { AssetSpecialProgram } = require('../models');

// GET /api/asset_special_programs - ดึงข้อมูลทั้งหมด
router.get('/', async (req, res) => {
  try {
    // หาโปรแกรมทั้งหมดโดยไม่ซ้ำชื่อ เพื่อใช้ใน Dropdown
    const programs = await AssetSpecialProgram.findAll({
      attributes: ['program_name'],
      group: ['program_name'],
      order: [['program_name', 'ASC']],
    });
    res.json(programs);
  } catch (error) {
    console.error('CRITICAL ERROR fetching asset special programs:', error);
    res.status(500).json({ error: 'Failed to fetch data from the server.' });
  }
});

module.exports = router;