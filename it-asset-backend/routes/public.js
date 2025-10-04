// routes/public.js
const express = require("express");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ✨ 1. เปลี่ยนมา import ทุกอย่างจาก models/index.js ที่เดียว
const { Ticket, Asset, Employee, Faq } = require("../models");

const router = express.Router();

/* ===================== Upload config ===================== */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tickets");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jfif") ext = ".jpg";
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${safeBase}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ===================== PUBLIC ROUTES ===================== */

// ✨ 2. สร้าง Endpoint ใหม่สำหรับ Form โดยเฉพาะ (วิธีที่แนะนำ)
router.get("/form-options", async (req, res) => {
  try {
    const [assets, employees] = await Promise.all([
      Asset.findAll({
        attributes: ["asset_name"],
        order: [["asset_name", "ASC"]],
      }),
      Employee.findAll({
        attributes: ["name"],
        where: { status: "Active" },
        order: [["name", "ASC"]],
      }),
    ]);

    res.json({
      assets: assets.map((a) => a.asset_name),
      employees: employees.map((e) => e.name),
    });
  } catch (error) {
    console.error("Error fetching public form options:", error);
    res.status(500).json({ error: "Failed to fetch form options" });
  }
});

// POST: /api/public/tickets - สร้าง Ticket ใหม่
// (โค้ดส่วนนี้ทำงานถูกต้องแล้ว ไม่ต้องแก้ไข)
router.post("/tickets", upload.single("attachment_user"), async (req, res) => {
  try {
    const { reporter_name, asset_code, contact_phone, problem_description } =
      req.body;
    const payload = {
      reporter_name,
      asset_code,
      contact_phone,
      problem_description,
      report_date: new Date(),
    };
    if (req.file) {
      payload.attachment_user_url = `/uploads/tickets/${req.file.filename}`;
    }
    const newTicket = await Ticket.create(payload);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("POST /public/tickets error:", error);
    res
      .status(400)
      .json({ error: "Failed to create ticket", details: error.message });
  }
});

// GET: /api/public/faqs - ดึงข้อมูล FAQ ทั้งหมด
// (โค้ดส่วนนี้ทำงานถูกต้องแล้ว ไม่ต้องแก้ไข)
router.get("/faqs", async (req, res) => {
  try {
    const faqs = await Faq.findAll({ order: [["createdAt", "DESC"]] });
    res.json(faqs);
  } catch (e) {
    console.error("GET /public/faqs error:", e);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

/* ===================== DEPRECATED / ไม่แนะนำให้ใช้แล้ว ===================== */
// Endpoint เก่าเหล่านี้ไม่จำเป็นแล้ว เพราะเรามี /form-options ที่ดีกว่า
// ได้ทำการแก้ไขให้ถูกต้อง แต่แนะนำให้เปลี่ยนไปใช้ /form-options แทน

router.get("/asset-users", async (_req, res) => {
  try {
    const rows = await Employee.findAll({
      attributes: ["name"], // ✨ FIX: เปลี่ยนจาก fullName เป็น name
      where: { status: "Active" },
      order: [["name", "ASC"]],
    });
    res.json(rows.map((r) => r.name).filter(Boolean));
  } catch (e) {
    console.error("GET /api/public/asset-users error:", e);
    res.status(500).json({ error: "Failed to load asset users" });
  }
});

router.get("/assets-list", async (_req, res) => {
  try {
    const rows = await Asset.findAll({
      attributes: ["asset_name"], // ✨ FIX: เปลี่ยนเป็น asset_name
      where: { status_id: 1 }, // สมมติว่า 1 คือสถานะ 'Enable'
      order: [["asset_name", "ASC"]],
    });
    res.json(rows);
  } catch (e) {
    console.error("GET /api/public/assets-list error:", e);
    res.status(500).json({ error: "Failed to load assets list" });
  }
});

module.exports = router;
