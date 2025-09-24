// routes/tickets.js
const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Ticket = require("../models/ticket");

const router = express.Router();

/* ============ Local storage ============ */
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

/* ===== Helpers: map URL -> local path & safe unlink ===== */
function resolveLocalPathFromUrl(u) {
  try {
    if (!u) return null;
    const bn = path.basename(u);
    if (!bn) return null;
    return path.join(UPLOAD_DIR, bn);
  } catch {
    return null;
  }
}
function safeUnlink(p) {
  if (!p) return;
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn("unlink failed:", p, e.message);
  }
}

/* ============ List + Filter (Protected) ============ */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // เพิ่มดึงพารามิเตอร์
    const { status, startDate, endDate, reporterName, assetCode } = req.query;

    const where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.report_date = { [Op.between]: [start, end] };
    }
    // NEW: filter ชื่อผู้แจ้ง/รหัสทรัพย์
    if (reporterName) {
      where.reporter_name = { [Op.like]: `%${reporterName}%` };
    }
    if (assetCode) {
      where.asset_code = { [Op.like]: `%${assetCode}%` };
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
    console.error("GET /tickets error:", e);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

/* ============ PUBLIC list (no auth) ============ */
router.get("/public", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { status, startDate, endDate, reporterName, assetCode } = req.query;
    const where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.report_date = { [Op.between]: [start, end] };
    }
    if (reporterName) where.reporter_name = { [Op.like]: `%${reporterName}%` };
    if (assetCode) where.asset_code = { [Op.like]: `%${assetCode}%` };

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
    console.error("GET /tickets/public error:", e);
    res.status(500).json({ error: "Failed to fetch public tickets" });
  }
});

/* ============ Detail ============ */
router.get("/:id", async (req, res) => {
  try {
    const t = await Ticket.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "Ticket not found" });
    res.json(t);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch the ticket" });
  }
});

/* ============ History by asset ============ */
router.get("/asset/:asset_code", async (req, res) => {
  try {
    const rows = await Ticket.findAll({
      where: { asset_code: req.params.asset_code },
      order: [["report_date", "DESC"]],
    });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch ticket history" });
  }
});

/* ============ Update + Attachments (Admin/User) ============ */
router.put(
  "/:id",
  upload.fields([
    { name: "attachment_admin", maxCount: 1 },
    { name: "attachment_user", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const t = await Ticket.findByPk(req.params.id);
      if (!t) return res.status(404).json({ error: "Ticket not found" });

      const {
        solution,
        status,
        handler_name,
        problem_description,
        repair_type,
        contact_phone,
        remove_attachment_user,
        remove_attachment_admin,
      } = req.body;

      // build URLs ถ้ามีไฟล์อัปโหลด
      const fAdmin = req.files?.attachment_admin?.[0] || null;
      const fUser = req.files?.attachment_user?.[0] || null;
      const adminUrl = fAdmin ? `/uploads/tickets/${fAdmin.filename}` : null;
      const userUrl = fUser ? `/uploads/tickets/${fUser.filename}` : null;

      // เขียนลงคอลัมน์ที่มีอยู่ (รองรับทั้งแบบ 2 ช่อง และช่องเดียว)
      const hasUserCol = Object.prototype.hasOwnProperty.call(
        t.dataValues,
        "attachment_user_url"
      );
      const hasAdminCol = Object.prototype.hasOwnProperty.call(
        t.dataValues,
        "attachment_admin_url"
      );
      const hasSingle = Object.prototype.hasOwnProperty.call(
        t.dataValues,
        "attachment_url"
      );

      // เก็บค่าเดิมไว้เพื่อลบไฟล์เก่าถ้ามี
      const prevUserUrl = hasUserCol
        ? t.attachment_user_url
        : hasSingle
        ? t.attachment_url
        : null;
      const prevAdminUrl = hasAdminCol ? t.attachment_admin_url : null;

      // (1) ธงลบไฟล์ (ไม่อัปโหลดใหม่)
      if (remove_attachment_user === "true") {
        safeUnlink(resolveLocalPathFromUrl(prevUserUrl));
        if (hasUserCol) t.attachment_user_url = null;
        else if (hasSingle) t.attachment_url = null;
      }
      if (remove_attachment_admin === "true") {
        safeUnlink(resolveLocalPathFromUrl(prevAdminUrl));
        if (hasAdminCol) t.attachment_admin_url = null;
        else if (hasSingle) t.attachment_url = null;
      }

      // (2) อัปโหลดใหม่ -> ลบไฟล์เดิมทิ้งแล้วตั้งค่าใหม่
      if (userUrl) {
        safeUnlink(resolveLocalPathFromUrl(prevUserUrl));
        if (hasUserCol) t.attachment_user_url = userUrl;
        else if (hasSingle) t.attachment_url = userUrl;
      }
      if (adminUrl) {
        safeUnlink(resolveLocalPathFromUrl(prevAdminUrl));
        if (hasAdminCol) t.attachment_admin_url = adminUrl;
        else if (hasSingle) t.attachment_url = adminUrl;
      }

      // อัปเดตฟิลด์อื่นๆ
      if (solution !== undefined) t.solution = solution;
      if (status !== undefined) t.status = status;
      if (handler_name !== undefined) t.handler_name = handler_name;
      if (problem_description !== undefined)
        t.problem_description = problem_description;
      if (repair_type !== undefined) t.repair_type = repair_type;
      if (contact_phone !== undefined) t.contact_phone = contact_phone;

      await t.save();
      res.json(t);
    } catch (e) {
      console.error("PUT /tickets/:id error:", e);
      res
        .status(500)
        .json({ error: "Failed to update ticket", details: e.message });
    }
  }
);

/* ============ Delete ============ */
router.delete("/:id", async (req, res) => {
  try {
    const t = await Ticket.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "Ticket not found" });

    // รองรับทั้ง schema แยกช่องและช่องเดียว
    const userUrl = Object.prototype.hasOwnProperty.call(
      t.dataValues,
      "attachment_user_url"
    )
      ? t.attachment_user_url
      : Object.prototype.hasOwnProperty.call(t.dataValues, "attachment_url")
      ? t.attachment_url
      : null;
    const adminUrl = Object.prototype.hasOwnProperty.call(
      t.dataValues,
      "attachment_admin_url"
    )
      ? t.attachment_admin_url
      : null;

    safeUnlink(resolveLocalPathFromUrl(userUrl));
    safeUnlink(resolveLocalPathFromUrl(adminUrl));

    await t.destroy();
    res.status(204).send();
  } catch (e) {
    console.error("DELETE /tickets/:id error:", e);
    res
      .status(500)
      .json({ error: "Failed to delete ticket", details: e.message });
  }
});

module.exports = router;
