// routes/public.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

const Ticket = require("../models/ticket");
const Asset = require("../models/asset");

const router = express.Router();

/* ============ Local storage (multer.diskStorage) ============ */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tickets");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jfif") ext = ".jpg"; // แปลง jfif -> jpg

    const safe = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${safe}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ============ Public Routes ============ */

/**
 * GET /api/public/asset-users
 * คืนรายชื่อ "พนักงานผู้ใช้ทรัพย์สิน" จาก Asset.user_name (ไม่ใช้ login username)
 * - unique
 * - ตัดค่าว่าง/null
 * - เรียงตามตัวอักษร (ASC)
 */
router.get("/asset-users", async (_req, res) => {
  try {
    const rows = await Asset.findAll({
      attributes: ["user_name"],
      where: { user_name: { [Op.ne]: null } },
      group: ["user_name"],
      order: [["user_name", "ASC"]],
    });
    const names = rows.map((r) => r.user_name).filter(Boolean);
    res.json(names);
  } catch (e) {
    console.error("GET /asset-users error:", e);
    res.status(500).json({ error: "Failed to fetch asset users" });
  }
});

// รายการทรัพย์สิน (ใช้แสดง Asset Code)
router.get("/assets-list", async (_req, res) => {
  try {
    const rows = await Asset.findAll({
      attributes: ["asset_code", "model"],
      order: [["asset_code", "ASC"]],
    });
    res.json(rows);
  } catch (e) {
    console.error("GET /assets-list error:", e);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// ผู้ใช้สร้าง ticket + แนบไฟล์ (field: attachment_user หรือชื่อเก่า attachment)
router.post(
  "/tickets",
  upload.fields([
    { name: "attachment_user", maxCount: 1 },
    { name: "attachment", maxCount: 1 }, // รองรับชื่อเดิม
  ]),
  async (req, res) => {
    try {
      const {
        reporter_name,
        asset_code,
        contact_phone = "",
        problem_description,
      } = req.body;
      if (!reporter_name || !asset_code || !problem_description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const f =
        req.files?.attachment_user?.[0] || req.files?.attachment?.[0] || null;
      const fileUrl = f ? `/uploads/tickets/${f.filename}` : null;

      // ถ้ามีคอลัมน์แยก -> ใช้ attachment_user_url, ถ้าไม่มีก็ fallback ไป attachment_url
      const hasUserCol = "attachment_user_url" in Ticket.getAttributes();

      const t = await Ticket.create({
        reporter_name,
        asset_code,
        contact_phone,
        problem_description,
        status: "Wait",
        report_date: new Date(),
        ...(hasUserCol
          ? { attachment_user_url: fileUrl }
          : { attachment_url: fileUrl }),
      });

      res.status(201).json(t);
    } catch (e) {
      console.error("POST /public/tickets error:", e);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  }
);

module.exports = router;
