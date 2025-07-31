const express = require('express');
const MasterData = require('../models/masterData'); // ตรวจสอบว่า import MasterData model ถูกต้อง
const router = express.Router();

// GET /api/master-data/:type - ดึงข้อมูลทั้งหมดตามประเภท
// เช่น /api/master-data/repair_type จะดึงรายการประเภทการซ่อมทั้งหมด
// หรือ /api/master-data/department จะดึงรายการแผนกทั้งหมด
router.get('/:type', async (req, res) => {
  try {
    const items = await MasterData.findAll({
      where: { type: req.params.type },
      order: [['value', 'ASC']] // เรียงตามตัวอักษรของ Value
    });
    res.json(items);
  } catch (error) {
    console.error(`Failed to fetch master data for type ${req.params.type}:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.type}` });
  }
});

// POST /api/master-data - เพิ่มข้อมูล Master Data ใหม่
// ใช้สำหรับเพิ่ม 'repair_type', 'category', 'brand', 'department' หรือ Type อื่นๆ
router.post('/', async (req, res) => {
  try {
    const { type, value } = req.body; // รับค่า type และ value จาก request body
    if (!type || !value) {
      return res.status(400).json({ error: 'Type and Value are required' });
    }
    const newItem = await MasterData.create({ type, value });
    res.status(201).json(newItem);
  } catch (error) {
    // กรณีมีข้อมูล Type และ Value ซ้ำกัน (Unique constraint)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'This item (Type and Value) already exists.' });
    }
    console.error("Error creating master data:", error);
    res.status(500).json({ error: 'Failed to add new item' });
  }
});

// DELETE /api/master-data/:id - ลบข้อมูล Master Data
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await MasterData.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error("Error deleting master data:", error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;