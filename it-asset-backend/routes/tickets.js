const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✨ แก้ไข: ใช้ชื่อไฟล์เป็นตัวพิมพ์ใหญ่ทั้งหมด (PascalCase)
const Ticket = require("../models/Ticket");
const Asset = require("../models/Asset");
const Employee = require("../models/Employee");
const User = require("../models/User");

const ticketUploadsDir = path.join(__dirname, "../uploads/tickets");
if (!fs.existsSync(ticketUploadsDir)) {
  fs.mkdirSync(ticketUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ticketUploadsDir);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน โดยใช้ timestamp + ชื่อไฟล์เดิม
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

// GET ticket history for a specific asset by assetCode
router.get("/asset/:assetCode", async (req, res) => {
  try {
    const asset = await Asset.findOne({ where: { asset_name: req.params.assetCode } });
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const tickets = await Ticket.findAll({
      where: { asset_id: asset.id },
      include: [
        { model: Asset, attributes: ['asset_name'] },
        { model: Employee, attributes: ['name'] },
        { model: User, as: 'handler', attributes: ['username'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching asset ticket history:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: Asset, attributes: ['asset_name'] },
        { model: Employee, attributes: ['name'] },
        { model: User, as: 'handler', attributes: ['username'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (err) {
    // เพิ่ม Log เพื่อให้เห็น Error ที่แท้จริงใน Console ของ Backend
    console.error("Error fetching tickets:", err); 
    res.status(500).json({ error: err.message });
  }
});

// POST a new ticket
router.post(
  "/",
  // Middleware ของ Multer จะจัดการไฟล์ก่อนเข้า controller
  upload.fields([
    { name: 'issue_attachment', maxCount: 1 },
    { name: 'solution_attachment', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const ticketData = req.body;

      // เช็คว่ามีไฟล์แนบมาหรือไม่ แล้วเก็บ path
      if (req.files && req.files.issue_attachment) {
        ticketData.issue_attachment_path = `/uploads/tickets/${req.files.issue_attachment[0].filename}`;
      }
      if (req.files && req.files.solution_attachment) {
        ticketData.solution_attachment_path = `/uploads/tickets/${req.files.solution_attachment[0].filename}`;
      }

      const newTicket = await Ticket.create(ticketData);
      res.status(201).json(newTicket);
    } catch (err) {
      console.error("Error creating ticket:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT update a ticket
router.put(
  "/:id",
  upload.fields([
    { name: 'issue_attachment', maxCount: 1 },
    { name: 'solution_attachment', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const ticketData = req.body;

      // เช็คว่ามีไฟล์แนบมาหรือไม่ แล้วเก็บ path
      if (req.files && req.files.issue_attachment) {
        ticketData.issue_attachment_path = `/uploads/tickets/${req.files.issue_attachment[0].filename}`;
      }
      if (req.files && req.files.solution_attachment) {
        ticketData.solution_attachment_path = `/uploads/tickets/${req.files.solution_attachment[0].filename}`;
      }

      await Ticket.update(ticketData, { where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating ticket:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE a ticket
router.delete("/:id", async (req, res) => {
  try {
    await Ticket.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;