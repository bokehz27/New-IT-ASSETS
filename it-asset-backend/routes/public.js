// routes/public.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Sequelize } = require('sequelize');
const Ticket = require('../models/ticket');
const Asset = require('../models/asset');

const router = express.Router();

// Cloudinary configuration (ตรวจสอบว่าตั้งค่า environment variables ถูกต้อง)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/public/tickets - สร้างใบแจ้งซ่อมใหม่
// Endpoint นี้จะรับข้อมูลจากทั้งผู้ใช้ทั่วไปและ Admin
router.post('/tickets', upload.single('attachment'), async (req, res) => {
  try {
    // เพิ่ม solution เข้ามาใน req.body
    const { reporter_name, asset_code, problem_description, contact_phone, handler_name, status, repair_type, solution } = req.body; // <-- เพิ่ม solution ตรงนี้
    let attachment_url = null;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "it_asset_tickets"
      });
      attachment_url = result.secure_url;
    }

    const newTicket = await Ticket.create({
      reporter_name,
      asset_code,
      problem_description,
      contact_phone,
      attachment_url,
      // เพิ่มฟิลด์เหล่านี้ (ถ้ามาจาก Admin จะมีค่า ถ้ามาจาก Public จะเป็น undefined/empty)
      handler_name: handler_name || null, 
      status: status || 'Request', 
      repair_type: repair_type || null,
      solution: solution || null // <-- เพิ่มการบันทึก solution ตรงนี้
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Ticket submission error:", error);
    res.status(500).json({ error: 'Failed to submit ticket.' });
  }
});

// GET /api/public/asset-users - ดึงรายชื่อผู้ใช้จากตาราง assets
router.get('/asset-users', async (req, res) => {
  try {
    const users = await Asset.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('user_name')), 'user_name']
      ],
      where: {
        user_name: { [Sequelize.Op.ne]: null, [Sequelize.Op.ne]: '' }
      }
    });
    res.json(users.map(u => u.user_name));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset users' });
  }
});

// GET /api/public/assets-list - ดึงรหัสอุปกรณ์และรุ่นทั้งหมด
router.get('/assets-list', async (req, res) => {
  try {
    const assets = await Asset.findAll({
      attributes: ['asset_code', 'model'],
      where: {
        asset_code: {
          [Sequelize.Op.ne]: null,
          [Sequelize.Op.ne]: ''
        }
      },
      order: [['asset_code', 'ASC']]
    });
    res.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets list", error);
    res.status(500).json({ error: 'Failed to fetch assets list' });
  }
});

module.exports = router;