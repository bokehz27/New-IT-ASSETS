const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
// Department, Position, Email ไม่จำเป็นต้องใช้ในไฟล์นี้แล้ว ถ้าไม่ได้ใช้ที่อื่น
// const Department = require("../models/Department");
// const Position = require("../models/Position");
// const Email = require("../models/Email");

// [GET] /api/employees - ดึงข้อมูลพนักงานทั้งหมด
router.get("/", async (req, res) => {
  try {
    // ✨ แก้ไข: เอา include ออกเพื่อให้ส่งข้อมูลแบบปกติ
    const data = await Employee.findAll();
    res.json(data);
  } catch (err) { 
    console.error("Error fetching employees:", err); // เพิ่ม log เพื่อช่วย debug
    res.status(500).json({ error: err.message }); 
  }
});

// [POST] /api/employees - สร้างพนักงานใหม่
router.post("/", async (req, res) => {
  try {
    const item = await Employee.create({
      name: req.body.name,
      department_id: req.body.department_id,
      position_id: req.body.position_id,
      email_id: req.body.email_id,
      status: req.body.status // ✨ แก้ไข: เพิ่ม status
    });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] /api/employees/bulk - (ถ้ามี) สร้างพนักงานหลายคน
// หากคุณทำฟังก์ชัน Import ข้อมูล อย่าลืมเพิ่ม status ใน Route นี้ด้วย
router.post("/bulk", async (req, res) => {
  try {
    const employees = req.body.map(emp => ({
        ...emp,
        status: emp.status || 'Active' // เพิ่ม status หรือตั้งค่าดีฟอลต์
    }));
    const items = await Employee.bulkCreate(employees);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// [PUT] /api/employees/:id - อัปเดตข้อมูลพนักงาน
router.put("/:id", async (req, res) => {
  try {
    await Employee.update({
      name: req.body.name,
      department_id: req.body.department_id,
      position_id: req.body.position_id,
      email_id: req.body.email_id,
      status: req.body.status // ✨ แก้ไข: เพิ่ม status
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [DELETE] /api/employees/:id - ลบพนักงาน
router.delete("/:id", async (req, res) => {
  try {
    await Employee.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;