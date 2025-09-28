const express = require("express");
const { Op, fn, col, where } = require("sequelize");
const multer = require("multer");
const Papa = require("papaparse");
const path = require("path");
const fs = require("fs");

const Asset = require("../models/asset");
const AssetSpecialProgram = require("../models/AssetSpecialProgram");
const sequelize = require("../config/database");

const router = express.Router();

/**
 * =========================
 * Upload CSV (Bulk Import Asset)
 * =========================
 */
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

router.post("/upload", uploadMemory.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  try {
    const csvData = req.file.buffer.toString("utf8");
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const assetsToCreate = results.data.map((row) => {
            for (const key in row) {
              if (row[key] === "" || row[key] === "N/A") row[key] = null;
            }
            if (row.start_date && !Date.parse(row.start_date))
              row.start_date = null;
            return row;
          });
          await Asset.bulkCreate(assetsToCreate);
          res
            .status(201)
            .json({
              message: `${assetsToCreate.length} assets imported successfully.`,
            });
        } catch (dbError) {
          console.error("Database import error:", dbError);
          res
            .status(500)
            .json({
              error: "Failed to import data into the database.",
              details: dbError.message,
            });
        }
      },
      error: (parseError) => {
        console.error("CSV parsing error:", parseError);
        res.status(400).json({ error: "Failed to parse CSV file." });
      },
    });
  } catch (error) {
    console.error("Upload process error:", error);
    res
      .status(500)
      .json({
        error: "An unexpected error occurred during the upload process.",
      });
  }
});

/**
 * =========================
 * Upload BitLocker CSV File (ใหม่)
 * =========================
 */
const bitlockerDir = path.join(__dirname, "../uploads/bitlocker");
if (!fs.existsSync(bitlockerDir))
  fs.mkdirSync(bitlockerDir, { recursive: true });

// เพิ่มโฟลเดอร์ log สำหรับเก็บไฟล์เก่า
const logDir = path.join(__dirname, "../uploads/log_bitlocker");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const storageBL = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bitlockerDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadBL = multer({ storage: storageBL });

router.post(
  "/:assetId/upload-bitlocker",
  uploadBL.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "กรุณาเลือกไฟล์" });

      const asset = await Asset.findByPk(req.params.assetId);
      if (!asset) return res.status(404).json({ error: "Asset not found." });

      // ✅ ย้ายไฟล์เก่าไปเก็บใน log
      if (asset.bitlocker_file_url) {
        const oldFilePath = path.join(
          bitlockerDir,
          path.basename(asset.bitlocker_file_url)
        );
        if (fs.existsSync(oldFilePath)) {
          const logFileName = `${Date.now()}-${path.basename(
            asset.bitlocker_file_url
          )}`;
          const logPath = path.join(logDir, logFileName);
          fs.renameSync(oldFilePath, logPath);
        }
      }

      // อัปเดตไฟล์ใหม่
      asset.bitlocker_file_url = `/uploads/bitlocker/${req.file.filename}`;
      await asset.save();

      res.json({
        message: "อัปโหลดไฟล์สำเร็จ",
        file_url: asset.bitlocker_file_url,
      });
    } catch (error) {
      console.error("BitLocker upload error:", error);
      res
        .status(500)
        .json({ error: "ไม่สามารถอัปโหลดไฟล์ได้", details: error.message });
    }
  }
);

/**
 * =========================
 * Delete BitLocker File (ย้ายไป log)
 * =========================
 */
router.delete("/:assetId/delete-bitlocker", async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.assetId);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    if (asset.bitlocker_file_url) {
      const oldFile = path.join(
        bitlockerDir,
        path.basename(asset.bitlocker_file_url)
      );
      if (fs.existsSync(oldFile)) {
        // ย้ายไฟล์ไป log
        const logFileName = `${Date.now()}-${path.basename(
          asset.bitlocker_file_url
        )}`;
        const logPath = path.join(logDir, logFileName);
        fs.renameSync(oldFile, logPath);
      }

      // ล้างค่าใน DB
      asset.bitlocker_file_url = null;
      await asset.save();
    }

    res.json({ message: "ไฟล์ถูกลบและย้ายไป log แล้ว" });
  } catch (error) {
    console.error("Delete BitLocker file error:", error);
    res
      .status(500)
      .json({ error: "ไม่สามารถลบไฟล์ได้", details: error.message });
  }
});

/**
 * =========================
 * [R] List assets
 * =========================
 */
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 20, filter = "" } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { [Op.and]: [] };

    if (search) {
      whereClause[Op.and].push({
        [Op.or]: [
          { asset_code: { [Op.like]: `%${search}%` } },
          { user_name: { [Op.like]: `%${search}%` } },
          { user_id: { [Op.like]: `%${search}%` } },
          { ip_address: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (filter === "incomplete") {
      const assetAttributes = Object.keys(Asset.rawAttributes);
      const fieldsToCheck = assetAttributes.filter(
        (attr) =>
          ![
            "id",
            "createdAt",
            "updatedAt",
            "windows_version",
            "windows_key",
            "office_version",
            "office_key",
            "antivirus",
            "bitlocker_file_url",
          ].includes(attr)
      );

      const attrsWithTypes = Asset.rawAttributes;
      const orConditions = fieldsToCheck.reduce((acc, field) => {
        const type = attrsWithTypes[field].type.constructor.name;
        acc.push({ [field]: { [Op.eq]: null } });
        if (type === "STRING" || type === "TEXT")
          acc.push({ [field]: { [Op.eq]: "" } });
        return acc;
      }, []);
      whereClause[Op.and].push({ [Op.or]: orConditions });
    }

    if (whereClause[Op.and].length === 0) delete whereClause[Op.and];

    const { count, rows } = await Asset.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["updatedAt", "DESC"]],
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      assets: rows,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

/**
 * =========================
 * [R] Get asset by id
 * =========================
 */
router.get("/:id", async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{ model: AssetSpecialProgram, as: "specialPrograms" }],
    });
    if (asset) res.json(asset);
    else res.status(404).json({ error: "Asset not found" });
  } catch (error) {
    console.error(`Error fetching asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

/**
 * =========================================
 * [C] Create asset
 * =========================================
 */
router.post("/", async (req, res) => {
  const { specialPrograms, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const newAsset = await Asset.create(assetData, { transaction });

    if (specialPrograms?.length > 0) {
      const programsToCreate = specialPrograms
        .filter((prog) => prog.program_name)
        .map((prog) => ({
          program_name: prog.program_name,
          license_key: prog.license_key || null,
          assetId: newAsset.id,
        }));
      if (programsToCreate.length > 0)
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
    }

    await transaction.commit();
    res.status(201).json(newAsset);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating asset:", error);
    res
      .status(400)
      .json({ error: "Failed to create asset", details: error.errors });
  }
});

/**
 * =========================================
 * [U] Update asset
 * =========================================
 */
router.put("/:id", async (req, res) => {
  const { specialPrograms, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ error: "Asset not found" });
    }

    await asset.update(assetData, { transaction });

    await AssetSpecialProgram.destroy({
      where: { assetId: req.params.id },
      transaction,
    });
    if (specialPrograms?.length > 0) {
      const programsToCreate = specialPrograms
        .filter((prog) => prog.program_name)
        .map((prog) => ({
          program_name: prog.program_name,
          license_key: prog.license_key || null,
          assetId: asset.id,
        }));
      if (programsToCreate.length > 0)
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
    }

    await transaction.commit();
    res.json(asset);
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating asset with id ${req.params.id}:`, error);
    res
      .status(400)
      .json({ error: "Failed to update asset", details: error.errors });
  }
});

/**
 * =========================================
 * Replace Asset (ไม่มี BitlockerKey แล้ว)
 * =========================================
 */
router.post("/:id/replace", async (req, res) => {
  const DEFAULT_FIELDS = [
    "ip_address",
    "wifi_registered",
    "antivirus",
    "user_name",
    "user_id",
    "department",
    "location",
    "category",
    "subcategory",
    "office_version",
    "office_key",
    "specialPrograms",
  ];

  const { newAssetCode, fieldsToCopy } = req.body || {};
  const fields =
    Array.isArray(fieldsToCopy) && fieldsToCopy.length > 0
      ? fieldsToCopy
      : DEFAULT_FIELDS;

  if (!newAssetCode || !String(newAssetCode).trim())
    return res.status(400).json({ message: "newAssetCode is required." });

  const normCode = String(newAssetCode)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");

  const t = await sequelize.transaction();
  try {
    const oldAsset = await Asset.findByPk(req.params.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!oldAsset) {
      await t.rollback();
      return res.status(404).json({ message: "Old asset not found." });
    }

    const dbNormExpr = fn(
      "REPLACE",
      fn("REPLACE", fn("UPPER", col("asset_code")), " ", ""),
      "-",
      ""
    );
    const existed = await Asset.findOne({
      where: where(dbNormExpr, normCode),
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (existed) {
      await t.rollback();
      return res.status(409).json({ message: "newAssetCode already exists." });
    }

    const ALLOWED_SCALAR = [
      "ip_address",
      "wifi_registered",
      "antivirus",
      "user_name",
      "user_id",
      "department",
      "location",
      "category",
      "subcategory",
      "office_version",
      "office_key",
    ];

    const createPayload = { asset_code: normCode, status: "Enable" };
    for (const k of fields)
      if (ALLOWED_SCALAR.includes(k)) createPayload[k] = oldAsset[k] ?? null;

    const newAsset = await Asset.create(createPayload, { transaction: t });

    if (fields.includes("specialPrograms")) {
      const list = await AssetSpecialProgram.findAll({
        where: { assetId: oldAsset.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      for (const row of list)
        await row.update({ assetId: newAsset.id }, { transaction: t });
    }

    const clearPayload = {};
    for (const k of fields)
      if (ALLOWED_SCALAR.includes(k)) clearPayload[k] = null;
    clearPayload.status = "Replaced";
    await oldAsset.update(clearPayload, { transaction: t });

    await t.commit();
    const refreshed = await Asset.findByPk(newAsset.id, {
      include: [{ model: AssetSpecialProgram, as: "specialPrograms" }],
    });

    return res
      .status(201)
      .json({
        message: "Asset created and MOVED successfully.",
        newAsset: refreshed,
      });
  } catch (err) {
    console.error("Replace (move) error:", err);
    try {
      await t.rollback();
    } catch (_) {}
    return res.status(500).json({ message: "Failed to move asset data." });
  }
});

/**
 * =========================
 * [D] Delete asset
 * =========================
 */
router.delete("/:id", async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (asset) {
      await asset.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  } catch (error) {
    console.error(`Error deleting asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

module.exports = router;
