// routes/assets.js (แก้ไขแล้ว)
const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sequelize = require("../config/database");
const exceljs = require("exceljs");

// Import all necessary models
const Asset = require("../models/Asset");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Brand = require("../models/Brand");
const Model = require("../models/Model");
const Ram = require("../models/Ram");
const Cpu = require("../models/Cpu");
const Storage = require("../models/Storage");
const WindowsVersion = require("../models/WindowsVersion");
const OfficeVersion = require("../models/OfficeVersion");
const AntivirusProgram = require("../models/AntivirusProgram");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Location = require("../models/Location");
const AssetStatus = require("../models/AssetStatus");
const AssetIpAssignment = require("../models/AssetIpAssignment");
const IpPool = require("../models/IpPool");
const SpecialProgram = require("../models/SpecialProgram");
const AssetSpecialProgram = require("../models/AssetSpecialProgram");

Asset.belongsTo(Employee, { foreignKey: "employee_id" });
Employee.hasMany(Asset, { foreignKey: "employee_id" });

const router = express.Router();

// Helper function to get associations for queries
const getAssetAssociations = () => [
  { model: Category, attributes: ["name"] },
  { model: Subcategory, attributes: ["name"] },
  { model: Brand, attributes: ["name"] },
  { model: Model, attributes: ["name"] },
  { model: Ram, attributes: ["size"] },
  { model: Cpu, attributes: ["name"] },
  { model: Storage, attributes: ["size"] },
  { model: WindowsVersion, attributes: ["name"] },
  { model: OfficeVersion, attributes: ["name"] },
  { model: AntivirusProgram, attributes: ["name"] },
  // ✨ FIX: Removed non-existent 'employeeId' attribute
  { model: Employee, attributes: ["name"] },
  { model: Department, attributes: ["name"] },
  { model: Location, attributes: ["name"] },
  { model: AssetStatus, attributes: ["name"] },

  {
    model: AssetIpAssignment,
    as: "ipAssignments",
    include: [{ model: IpPool, attributes: ["id", "ip_address", "vlan_id"] }],
  },
  {
    model: AssetSpecialProgram,
    as: "specialPrograms",
    include: [{ model: SpecialProgram, attributes: ["name"] }],
  },
];

// Helper to flatten the asset object for frontend
const flattenAsset = (asset) => {
  const flat = asset.toJSON();
  const flattened = {
    ...flat,
    category: flat.Category?.name || null,
    subcategory: flat.Subcategory?.name || null,
    brand: flat.Brand?.name || null,
    model: flat.Model?.name || null,
    ram: flat.Ram?.size || null,
    cpu: flat.Cpu?.name || null,
    storage: flat.Storage?.size || null,
    windows_version: flat.WindowsVersion?.name || null,
    office_version: flat.OfficeVersion?.name || null,
    antivirus: flat.AntivirusProgram?.name || null,
    user_name: flat.Employee?.name || null,
    // Frontend is using user_id from the asset table directly, which is correct
    // user_id: flat.Employee?.employeeId || null,
    department: flat.Department?.name || null,
    location: flat.Location?.name || null,
    status: flat.AssetStatus?.name || null,
    assignedIps:
      flat.ipAssignments
        ?.map((a) => ({
          id: a.IpPool?.id,
          ip_address: a.IpPool?.ip_address,
          vlan_id: a.IpPool?.vlan_id,
        }))
        .filter((ip) => ip.id && ip.ip_address) || [],

    specialPrograms:
      flat.specialPrograms?.map((p) => ({
        id: p.id,
        program_name: p.SpecialProgram?.name,
        program_id: p.program_id,
        license_key: p.license_key,
      })) || [],
  };

  // Remove nested objects to keep payload clean
  delete flattened.Category;
  delete flattened.Subcategory;
  delete flattened.Brand;
  delete flattened.Model;
  delete flattened.Ram;
  delete flattened.Cpu;
  delete flattened.Storage;
  delete flattened.WindowsVersion;
  delete flattened.OfficeVersion;
  delete flattened.AntivirusProgram;
  delete flattened.Employee;
  delete flattened.Department;
  delete flattened.Location;
  delete flattened.AssetStatus;
  delete flattened.ipAssignments;
  delete flattened.IpPool;

  return flattened;
};

// ... (File upload logic for BitLocker remains the same)
const bitlockerDir = path.join(__dirname, "../uploads/bitlocker");
if (!fs.existsSync(bitlockerDir))
  fs.mkdirSync(bitlockerDir, { recursive: true });

// ✨ START: โค้ดที่แก้ไขใหม่ ✨
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // กำหนดโฟลเดอร์ที่จะเก็บไฟล์
    cb(null, bitlockerDir);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ใหม่ โดยใช้ assetId + ชื่อไฟล์เดิม เพื่อให้แน่ใจว่าไม่ซ้ำกัน
    // เช่น 1-bitlocker_keys.csv
    const newFilename = `${req.params.assetId}-${file.originalname}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/:assetId/upload-bitlocker",
  upload.single("file"),
  async (req, res) => {
    try {
      const asset = await Asset.findByPk(req.params.assetId);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      if (req.file) {
        // If there's an old file, delete it
        if (asset.bitlocker_csv_file) {
          const oldFilePath = path.join(
            __dirname,
            "..",
            asset.bitlocker_csv_file
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        asset.bitlocker_csv_file = `/uploads/bitlocker/${req.file.filename}`;
        await asset.save();
        res.json({
          message: "File uploaded successfully",
          filePath: asset.bitlocker_csv_file,
        });
      } else {
        res.status(400).json({ error: "No file uploaded" });
      }
    } catch (error) {
      console.error("Error uploading BitLocker file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

/**
 * =========================
 * Export to excel
 * =========================
 */
router.get("/reports/assets/export-simple", async (req, res) => {
  try {
    const { fields, export_special_programs, export_bitlocker_keys } =
      req.query;

    // ดึงข้อมูล Asset ทั้งหมดพร้อมข้อมูล关联
    const allAssetsRaw = await Asset.findAll({
      include: getAssetAssociations(),
      order: [["asset_name", "ASC"]],
    });
    const allAssets = allAssetsRaw.map(flattenAsset);

    const workbook = new exceljs.Workbook();

    // --- Sheet 1: Assets ---
    if (fields) {
      const assetSheet = workbook.addWorksheet("Assets");
      const selectedFields = fields.split(",");

      // สร้าง Headers
      assetSheet.columns = selectedFields.map((field) => ({
        header: field.replace(/_/g, " ").toUpperCase(),
        key: field,
        width: 25,
      }));

      // เพิ่มข้อมูล
      allAssets.forEach((asset) => {
        const rowData = {};
        selectedFields.forEach((field) => {
          if (field === "assignedIps" && Array.isArray(asset[field])) {
            rowData[field] = asset[field].map((ip) => ip.ip_address).join(", ");
          } else {
            rowData[field] = asset[field] || "N/A";
          }
        });
        assetSheet.addRow(rowData);
      });
    }

    // --- Sheet 2: Special Programs ---
    if (export_special_programs === "true") {
      const spSheet = workbook.addWorksheet("Special Programs");
      spSheet.columns = [
        { header: "ASSET_NAME", key: "asset_name", width: 20 },
        { header: "PROGRAM_NAME", key: "program_name", width: 30 },
        { header: "LICENSE_KEY", key: "license_key", width: 40 },
      ];
      allAssets.forEach((asset) => {
        if (asset.specialPrograms && asset.specialPrograms.length > 0) {
          asset.specialPrograms.forEach((prog) => {
            spSheet.addRow({
              asset_name: asset.asset_name,
              program_name: prog.program_name,
              license_key: prog.license_key || "N/A",
            });
          });
        }
      });
    }

    // --- Sheet 3: BitLocker ---
    if (export_bitlocker_keys === "true") {
      // You would typically fetch BitLocker details here.
      // For this example, we'll just export the file path.
      const blSheet = workbook.addWorksheet("BitLocker Info");
      blSheet.columns = [
        { header: "ASSET_NAME", key: "asset_name", width: 20 },
        { header: "BITLOCKER_FILE_PATH", key: "bitlocker_csv_file", width: 50 },
      ];
      allAssets.forEach((asset) => {
        if (asset.bitlocker_csv_file) {
          blSheet.addRow({
            asset_name: asset.asset_name,
            bitlocker_csv_file: asset.bitlocker_csv_file,
          });
        }
      });
    }

    // ส่งไฟล์กลับไป
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="assets_report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting asset report:", error);
    res.status(500).json({ error: "Failed to generate report." });
  }
});

/**
 * =========================
 * [R] List assets
 * =========================
 */
router.get("/", async (req, res) => {
  try {
    if (req.query.all) {
      // --- START: โค้ดที่แก้ไข ---
      const allAssetsRaw = await Asset.findAll({
        include: getAssetAssociations(), // 👈 ดึงข้อมูลทั้งหมดที่เกี่ยวข้อง
        order: [["asset_name", "ASC"]],
      });
      // ทำการ flatten ข้อมูลให้อยู่ในรูปแบบที่ Frontend ใช้งานได้ง่าย
      const allAssetsFlattened = allAssetsRaw.map(flattenAsset);
      return res.json(allAssetsFlattened);
      // --- END: โค้ดที่แก้ไข ---
    }

    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { asset_name: { [Op.like]: `%${search}%` } },
          { serial_number: { [Op.like]: `%${search}%` } },
          // '$Employee.name$' already covers searching for both name and employee ID (e.g., "K0976")
          { "$Employee.name$": { [Op.like]: `%${search}%` } },
          // ✨ FIX: Removed search on the non-existent 'employeeId' column
        ],
      };
    }

    const { count, rows } = await Asset.findAndCountAll({
      where: whereClause,
      include: getAssetAssociations().filter(
        (a) => a.model !== AssetSpecialProgram
      ), // Don't need special programs in list view
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["updatedAt", "DESC"]],
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      assets: rows.map(flattenAsset),
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
      include: getAssetAssociations(),
    });
    if (asset) {
      res.json(flattenAsset(asset));
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  } catch (error) {
    console.error(`Error fetching asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

// Helper function to resolve names to foreign keys
const resolveFks = async (data) => {
  const fkPayload = {};
  if (data.category)
    fkPayload.category_id = (
      await Category.findOne({ where: { name: data.category } })
    )?.id;
  if (data.subcategory)
    fkPayload.subcategory_id = (
      await Subcategory.findOne({ where: { name: data.subcategory } })
    )?.id;
  if (data.brand)
    fkPayload.brand_id = (
      await Brand.findOne({ where: { name: data.brand } })
    )?.id;
  if (data.model)
    fkPayload.model_id = (
      await Model.findOne({ where: { name: data.model } })
    )?.id;
  if (data.ram)
    fkPayload.ram_id = (await Ram.findOne({ where: { size: data.ram } }))?.id;
  if (data.cpu)
    fkPayload.cpu_id = (await Cpu.findOne({ where: { name: data.cpu } }))?.id;
  if (data.storage)
    fkPayload.storage_id = (
      await Storage.findOne({ where: { size: data.storage } })
    )?.id;
  if (data.windows_version)
    fkPayload.windows_version_id = (
      await WindowsVersion.findOne({ where: { name: data.windows_version } })
    )?.id;
  if (data.office_version)
    fkPayload.office_version_id = (
      await OfficeVersion.findOne({ where: { name: data.office_version } })
    )?.id;
  if (data.antivirus)
    fkPayload.antivirus_id = (
      await AntivirusProgram.findOne({ where: { name: data.antivirus } })
    )?.id;
  if (data.user_name)
    fkPayload.employee_id = (
      await Employee.findOne({ where: { name: data.user_name } })
    )?.id;
  if (data.department)
    fkPayload.department_id = (
      await Department.findOne({ where: { name: data.department } })
    )?.id;
  if (data.location)
    fkPayload.location_id = (
      await Location.findOne({ where: { name: data.location } })
    )?.id;
  if (data.status)
    fkPayload.status_id = (
      await AssetStatus.findOne({ where: { name: data.status } })
    )?.id;
  return fkPayload;
};

/**
 * =========================================
 * [C] Create asset
 * =========================================
 */
router.post("/", async (req, res) => {
  const { specialPrograms, ip_ids, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const fkIds = await resolveFks(assetData);
    const newAsset = await Asset.create(
      { ...assetData, ...fkIds },
      { transaction }
    );

    if (specialPrograms && specialPrograms.length > 0) {
      const programsToCreate = specialPrograms
        .filter((p) => p.program_id)
        .map((p) => ({
          ...p,
          asset_id: newAsset.id,
        }));
      if (programsToCreate.length > 0) {
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
      }
    }

    if (ip_ids && ip_ids.length > 0) {
      const assignments = ip_ids.map((ipId) => ({
        asset_id: newAsset.id,
        ip_id: ipId,
      }));
      await AssetIpAssignment.bulkCreate(assignments, { transaction });
    }

    await transaction.commit();
    res.status(201).json(newAsset);
  } catch (error) {
    await transaction.rollback();
    console.error("CRITICAL ERROR ON CREATE ASSET:", error);
    res.status(400).json({
      error: "Failed to create asset. See details.",
      details: error.errors || [{ message: error.message }],
    });
  }
});

/**
 * =========================================
 * Replace Asset
 * =========================================
 */
router.post("/clone-and-replace", async (req, res) => {
  const { oldAssetId, newAssetName, transferOptions } = req.body;

  if (!oldAssetId || !newAssetName || !transferOptions) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const t = await sequelize.transaction();
  try {
    const oldAsset = await Asset.findByPk(oldAssetId, {
      include: getAssetAssociations(),
      transaction: t,
    });
    if (!oldAsset) {
      await t.rollback();
      return res.status(404).json({ error: "Original asset not found." });
    }

    const replacedStatus = await AssetStatus.findOne({
      where: { name: "Replaced" },
      transaction: t,
    });
    const enabledStatus = await AssetStatus.findOne({
      where: { name: "Enable" },
      transaction: t,
    });
    if (!replacedStatus || !enabledStatus) {
      await t.rollback();
      return res
        .status(500)
        .json({
          error: "Could not find required statuses 'Replaced' or 'Enable'.",
        });
    }

    const dataToCopy = {
      asset_name: newAssetName,
      status_id: enabledStatus.id,
    };

    // --- ส่วนของการ "ย้าย" (คัดลอก และ ล้างค่า) ---
    if (transferOptions.employee_data) {
      dataToCopy.employee_id = oldAsset.employee_id;
      dataToCopy.user_id = oldAsset.user_id;
      oldAsset.employee_id = null;
      oldAsset.user_id = null;
    }
    if (transferOptions.department_id) {
      dataToCopy.department_id = oldAsset.department_id;
      oldAsset.department_id = null;
    }
    if (transferOptions.location_id) {
      dataToCopy.location_id = oldAsset.location_id;
      oldAsset.location_id = null;
    }
    if (transferOptions.office_config) {
      dataToCopy.office_version_id = oldAsset.office_version_id;
      dataToCopy.office_product_key = oldAsset.office_product_key;
      oldAsset.office_version_id = null;
      oldAsset.office_product_key = null;
    }
    if (transferOptions.antivirus_program_id) {
      dataToCopy.antivirus_program_id = oldAsset.antivirus_program_id;
      oldAsset.antivirus_program_id = null;
    }

    // --- สร้าง Asset ใหม่พร้อมข้อมูลที่คัดลอกมา ---
    const newAsset = await Asset.create(dataToCopy, { transaction: t });

    // --- ย้ายข้อมูลตารางเชื่อม (IP & Special Programs) ---
    if (transferOptions.ip_assignments) {
      await AssetIpAssignment.update(
        { asset_id: newAsset.id },
        { where: { asset_id: oldAssetId }, transaction: t }
      );
    }
    if (transferOptions.special_programs) {
      await AssetSpecialProgram.update(
        { asset_id: newAsset.id },
        { where: { asset_id: oldAssetId }, transaction: t }
      );
    }

    // --- อัปเดต Asset เก่า ---
    oldAsset.status_id = replacedStatus.id;
    const replacementNote = `\n--- Replaced on ${new Date().toLocaleDateString()} by ${
      newAsset.asset_name
    }. ---`;
    oldAsset.remark = (oldAsset.remark || "") + replacementNote;
    await oldAsset.save({ transaction: t });

    await t.commit();

    const finalNewAsset = await Asset.findByPk(newAsset.id, {
      include: getAssetAssociations(),
    });
    res
      .status(200)
      .json({
        message: "Asset cloned and replaced successfully",
        newAsset: flattenAsset(finalNewAsset),
      });
  } catch (error) {
    await t.rollback();
    console.error("Asset clone and replace failed:", error);
    res.status(500).json({ error: "An internal error occurred." });
  }
});

/**
 * =========================================
 * [U] Update asset
 * =========================================
 */
router.put("/:id", async (req, res) => {
  const { specialPrograms, ip_ids, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ error: "Asset not found" });
    }

    const fkIds = await resolveFks(assetData);
    await asset.update({ ...assetData, ...fkIds }, { transaction });

    // Handle special programs update
    await AssetSpecialProgram.destroy({
      where: { asset_id: req.params.id },
      transaction,
    });
    if (specialPrograms && specialPrograms.length > 0) {
      // ✨ FIX: เพิ่ม .filter(p => p.program_id) เข้าไปตรงนี้ ✨
      const programsToCreate = specialPrograms
        .filter((p) => p.program_id)
        .map((p) => ({
          program_id: p.program_id,
          license_key: p.license_key,
          asset_id: asset.id,
        }));

      if (programsToCreate.length > 0) {
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
      }
    }

    // Handle IP Assignments update
    await AssetIpAssignment.destroy({
      where: { asset_id: req.params.id },
      transaction,
    });
    if (ip_ids && ip_ids.length > 0) {
      const assignments = ip_ids.map((ipId) => ({
        asset_id: asset.id,
        ip_id: ipId,
      }));
      await AssetIpAssignment.bulkCreate(assignments, { transaction });
    }

    await transaction.commit();
    const updatedAsset = await Asset.findByPk(req.params.id, {
      include: getAssetAssociations(),
    });
    res.json(flattenAsset(updatedAsset));
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating asset with id ${req.params.id}:`, error);
    res
      .status(400)
      .json({ error: "Failed to update asset", details: error.errors });
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

/**
 * =========================================
 * ✨ [C] Bulk Create assets from JSON (for CSV import)
 * =========================================
 */
router.post("/upload", async (req, res) => {
  const assetsData = req.body; // คาดหวังข้อมูลที่เป็น Array of objects
  if (!Array.isArray(assetsData) || assetsData.length === 0) {
    return res
      .status(400)
      .json({
        error: "Invalid data format. Expecting a non-empty array of assets.",
      });
  }

  const transaction = await sequelize.transaction();
  try {
    const createdAssets = [];
    // เราประมวลผลทีละรายการ เพราะ resolveFks เป็น async และต้อง await ทีละแถว
    for (const asset of assetsData) {
      const fkIds = await resolveFks(asset);
      const newAsset = await Asset.create(
        { ...asset, ...fkIds },
        { transaction }
      );
      createdAssets.push(newAsset);
    }

    await transaction.commit();
    res
      .status(201)
      .json({
        message: `${createdAssets.length} assets imported successfully.`,
      });
  } catch (error) {
    await transaction.rollback();
    console.error("CRITICAL ERROR ON BULK CREATE ASSET:", error);
    res.status(400).json({
      error: "Failed to import assets. Please check data integrity.",
      details: error.errors
        ? error.errors.map((e) => e.message)
        : [{ message: error.message }],
    });
  }
});

module.exports = router;
