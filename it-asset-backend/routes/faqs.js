// routes/faqs.js
const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Faq = require("../models/faq");

const router = express.Router();

/* ============ ตั้งค่า Multer สำหรับ Upload ============ */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "faqs");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${safe}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB Limit

/* ===== Helpers สำหรับลบไฟล์ ===== */
function resolveLocalPathFromUrl(u) {
  if (!u) return null;
  return path.join(UPLOAD_DIR, path.basename(u));
}
function safeUnlink(p) {
  if (!p) return;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

/* ============ API สำหรับ Admin (Protected) ============ */

// GET All FAQs (with search)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { question: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } },
      ];
    }
    const faqs = await Faq.findAll({ where, order: [["updatedAt", "DESC"]] });
    res.json(faqs);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// GET Single FAQ
router.get("/:id", async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.json(faq);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch FAQ" });
  }
});

// POST Create new FAQ
router.post(
  "/",
  // 1. แก้ไข Multer ให้รับเฉพาะไฟล์ pdf
  upload.fields([{ name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    try {
      // 2. รับ video_url จาก req.body
      const { question, answer, category, video_url } = req.body;
      const pdfFile = req.files?.pdf?.[0];

      const newFaq = await Faq.create({
        question,
        answer,
        category,
        video_url: video_url || null, // 3. ใช้ video_url จาก req.body
        pdf_url: pdfFile ? `/uploads/faqs/${pdfFile.filename}` : null,
      });
      res.status(201).json(newFaq);
    } catch (e) {
      res
        .status(500)
        .json({ error: "Failed to create FAQ", details: e.message });
    }
  }
);

// PUT Update FAQ
router.put(
  "/:id",
  // 1. แก้ไข Multer ให้รับเฉพาะไฟล์ pdf
  upload.fields([{ name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    try {
      const faq = await Faq.findByPk(req.params.id);
      if (!faq) return res.status(404).json({ error: "FAQ not found" });

      // 2. รับ video_url จาก req.body และเอา remove_video ออก
      const { question, answer, category, video_url, remove_pdf } = req.body;
      const newPdf = req.files?.pdf?.[0];

      // 3. ลบ Logic การจัดการไฟล์วิดีโอออกทั้งหมด
      if (remove_pdf === "true") {
        safeUnlink(resolveLocalPathFromUrl(faq.pdf_url));
        faq.pdf_url = null;
      }

      if (newPdf) {
        safeUnlink(resolveLocalPathFromUrl(faq.pdf_url));
        faq.pdf_url = `/uploads/faqs/${newPdf.filename}`;
      }

      // Handle text data updates
      faq.question = question;
      faq.answer = answer;
      faq.category = category;
      faq.video_url = video_url; // 4. อัปเดต video_url โดยตรง

      await faq.save();
      res.json(faq);
    } catch (e) {
      res
        .status(500)
        .json({ error: "Failed to update FAQ", details: e.message });
    }
  }
);

// DELETE FAQ
router.delete("/:id", async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    // Delete associated files
    // safeUnlink(resolveLocalPathFromUrl(faq.video_url)); // ส่วนนี้ไม่จำเป็นแล้วเพราะ video_url เป็นลิงก์ภายนอก
    safeUnlink(resolveLocalPathFromUrl(faq.pdf_url));

    await faq.destroy();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

module.exports = router;
