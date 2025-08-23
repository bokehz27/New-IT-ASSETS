// routes/employees.js
const express = require('express');
const Employee = require('../models/Employee');
const router = express.Router();

// GET /api/employees - ดึงข้อมูลพนักงานทั้งหมด
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['fullName', 'ASC']] });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees - สร้างพนักงานใหม่
router.post('/', async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// DELETE /api/employees/:id - ลบพนักงาน
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// --- PUT /api/employees/:id - อัปเดตข้อมูลพนักงาน (ส่วนที่เพิ่มเข้ามาใหม่) ---
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    // ทำการอัปเดตข้อมูลจาก req.body
    await employee.update(req.body);
    res.json(employee); // ส่งข้อมูลที่อัปเดตแล้วกลับไป
  } catch (error) {
    console.error('Failed to update employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

module.exports = router;