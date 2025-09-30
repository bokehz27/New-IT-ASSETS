// routes/public.js
const express = require("express");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

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

/* helper */
function setAttachmentOnPayload(payload, url) {
  if (!url) return payload;
  const attrs = Ticket.rawAttributes || {};
  if ("attachment_user_url" in attrs) {
    payload.attachment_user_url = url;
  } else if ("attachment_url" in attrs) {
    payload.attachment_url = url;
  }
  return payload;
}


// ✨ 2. สร้าง Endpoint ใหม่สำหรับ Form โดยเฉพาะ (วิธีที่แนะนำ)
router.get('/form-options', async (req, res) => {
    try {
        const [assets, employees] = await Promise.all([
            Asset.findAll({
                attributes: ['asset_name'],
                order: [['asset_name', 'ASC']]
            }),
            Employee.findAll({
                attributes: ['name'],
                where: { status: 'Active' },
                order: [['name', 'ASC']]
            })
        ]);

        res.json({
            assets: assets.map(a => a.asset_name),
            employees: employees.map(e => e.name)
        });

    } catch (error) {
        console.error("Error fetching public form options:", error);
        res.status(500).json({ error: "Failed to fetch form options" });
    }
});


/* ===================== PUBLIC: list tickets ===================== */
router.get("/tickets", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { q, reporterName, assetCode, status, startDate, endDate } =
      req.query;

    const where = {};
    if (status) where.status = status;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.report_date = { [Op.between]: [start, end] };
    }

    if (q) {
      where[Op.or] = [
        { reporter_name: { [Op.like]: `%${q}%` } },
        { asset_code: { [Op.like]: `%${q}%` } },
      ];
    } else {
      if (reporterName)
        where.reporter_name = { [Op.like]: `%${reporterName}%` };
      if (assetCode) where.asset_code = { [Op.like]: `%${assetCode}%` };
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      order: [["report_date", "DESC"]],
      limit,
      offset,
    });

    res.json({
      tickets: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (e) {
    console.error("GET /api/public/tickets error:", e);
    res.status(500).json({ error: "Failed to fetch public tickets" });
  }
});

/* ===================== PUBLIC: create ticket ===================== */
router.post("/tickets", upload.single("attachment_user"), async (req, res) => {
  try {
    const { reporter_name, asset_code, contact_phone, problem_description } =
      req.body;

    if (!reporter_name || !asset_code || !problem_description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/tickets/${req.file.filename}`;
    }

    const payload = {
      reporter_name,
      asset_code,
      contact_phone: contact_phone || "",
      problem_description,
      status: "Request",
      report_date: new Date(),
    };
    setAttachmentOnPayload(payload, attachmentUrl);

    const ticket = await Ticket.create(payload);
    res.status(201).json(ticket);
  } catch (e) {
    console.error("POST /api/public/tickets error:", e);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

/* ===================== PUBLIC: dropdown helpers (FIXED) ===================== */
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
      attributes: ["asset_name", "model_id"], // ✨ FIX: เปลี่ยนจาก asset_code, model เป็น asset_name, model_id
      where: { status_id: 1 }, // สมมติว่า 1 คือสถานะ 'Enable'
      order: [["asset_name", "ASC"]],
    });
    res.json(rows);
  } catch (e) {
    console.error("GET /api/public/assets-list error:", e);
    res.status(500).json({ error: "Failed to load assets list" });
  }
});

// GET: /api/public/faqs - ดึงข้อมูล FAQ ทั้งหมด
router.get("/faqs", async (req, res) => {
  try {
    const faqs = await Faq.findAll({
      order: [
        ["category", "ASC"],
        ["question", "ASC"],
      ],
    });
    res.json(faqs);
  } catch (err) {
    console.error("Error fetching public FAQs:", err);
    res.status(500).json({ error: "Could not fetch FAQs" });
  }
});

module.exports = router;
