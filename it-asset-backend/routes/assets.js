// routes/assets.js (แก้ไขแล้ว)
const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sequelize = require("../config/database");

// Import all necessary models
const Asset = require("../models/asset");
const AssetSpecialProgram = require("../models/AssetSpecialProgram");
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

Asset.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasMany(Asset, { foreignKey: 'employee_id' });

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
  { model: AssetSpecialProgram, as: "specialPrograms" },
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

  return flattened;
};

// ... (File upload logic for BitLocker remains the same)
const bitlockerDir = path.join(__dirname, "../uploads/bitlocker");
if (!fs.existsSync(bitlockerDir)) fs.mkdirSync(bitlockerDir, { recursive: true });
const upload = multer({ dest: bitlockerDir });

router.post(
  "/:assetId/upload-bitlocker",
  upload.single('file'),
  async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.assetId);
        if (!asset) {
            return res.status(404).json({ error: "Asset not found" });
        }
        if (req.file) {
            // If there's an old file, delete it
            if (asset.bitlocker_csv_file) {
                const oldFilePath = path.join(__dirname, '..', asset.bitlocker_csv_file);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            asset.bitlocker_csv_file = `/uploads/bitlocker/${req.file.filename}`;
            await asset.save();
            res.json({ message: "File uploaded successfully", filePath: asset.bitlocker_csv_file });
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
 * [R] List assets
 * =========================
 */
router.get("/", async (req, res) => {
  try {
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
    if (data.category) fkPayload.category_id = (await Category.findOne({ where: { name: data.category } }))?.id;
    if (data.subcategory) fkPayload.subcategory_id = (await Subcategory.findOne({ where: { name: data.subcategory } }))?.id;
    if (data.brand) fkPayload.brand_id = (await Brand.findOne({ where: { name: data.brand } }))?.id;
    if (data.model) fkPayload.model_id = (await Model.findOne({ where: { name: data.model } }))?.id;
    if (data.ram) fkPayload.ram_id = (await Ram.findOne({ where: { size: data.ram } }))?.id;
    if (data.cpu) fkPayload.cpu_id = (await Cpu.findOne({ where: { name: data.cpu } }))?.id;
    if (data.storage) fkPayload.storage_id = (await Storage.findOne({ where: { size: data.storage } }))?.id;
    if (data.windows_version) fkPayload.windows_version_id = (await WindowsVersion.findOne({ where: { name: data.windows_version } }))?.id;
    if (data.office_version) fkPayload.office_version_id = (await OfficeVersion.findOne({ where: { name: data.office_version } }))?.id;
    if (data.antivirus) fkPayload.antivirus_id = (await AntivirusProgram.findOne({ where: { name: data.antivirus } }))?.id;
    if (data.user_name) fkPayload.employee_id = (await Employee.findOne({ where: { name: data.user_name } }))?.id;
    if (data.department) fkPayload.department_id = (await Department.findOne({ where: { name: data.department } }))?.id;
    if (data.location) fkPayload.location_id = (await Location.findOne({ where: { name: data.location } }))?.id;
    if (data.status) fkPayload.status_id = (await AssetStatus.findOne({ where: { name: data.status } }))?.id;
    return fkPayload;
}


/**
 * =========================================
 * [C] Create asset
 * =========================================
 */
router.post("/", async (req, res) => {
  const { specialPrograms, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const fkIds = await resolveFks(assetData);
    const newAsset = await Asset.create({ ...assetData, ...fkIds }, { transaction });

    if (specialPrograms && specialPrograms.length > 0) {
      const programsToCreate = specialPrograms
        .filter(p => p.program_name)
        .map(p => ({
          ...p,
          asset_id: newAsset.id
        }));
      if (programsToCreate.length > 0) {
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json(newAsset);
  } catch (error) {
    await transaction.rollback();
    console.error("CRITICAL ERROR ON CREATE ASSET:", error);
    res.status(400).json({
      error: "Failed to create asset. See details.",
      details: error.errors || [{ message: error.message }]
    });
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

    const fkIds = await resolveFks(assetData);
    await asset.update({ ...assetData, ...fkIds }, { transaction });

    // Handle special programs update
    await AssetSpecialProgram.destroy({ where: { asset_id: req.params.id }, transaction });
    if (specialPrograms && specialPrograms.length > 0) {
        const programsToCreate = specialPrograms
            .filter(p => p.program_name)
            .map(p => ({
                ...p,
                asset_id: asset.id
            }));
        if (programsToCreate.length > 0) {
            await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
        }
    }

    await transaction.commit();
    const updatedAsset = await Asset.findByPk(req.params.id, { include: getAssetAssociations() });
    res.json(flattenAsset(updatedAsset));
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating asset with id ${req.params.id}:`, error);
    res.status(400).json({ error: "Failed to update asset", details: error.errors });
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