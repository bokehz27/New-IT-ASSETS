const express = require('express');
const { Op, fn, col, where } = require('sequelize');
const multer = require('multer');
const Papa = require('papaparse');

const Asset = require('../models/asset');
const BitlockerKey = require('../models/bitlockerKey');
const AssetSpecialProgram = require('../models/assetSpecialProgram');
const sequelize = require('../config/database');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * =========================
 * Upload CSV (unchanged)
 * =========================
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }
  try {
    const csvData = req.file.buffer.toString('utf8');
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const assetsToCreate = results.data.map(row => {
            for (const key in row) {
              if (row[key] === '' || row[key] === 'N/A') { row[key] = null; }
            }
            if (row.start_date && !Date.parse(row.start_date)) { row.start_date = null; }
            return row;
          });
          await Asset.bulkCreate(assetsToCreate);
          res.status(201).json({ message: `${assetsToCreate.length} assets imported successfully.` });
        } catch (dbError) {
          console.error("Database import error:", dbError);
          res.status(500).json({ error: 'Failed to import data into the database.', details: dbError.message });
        }
      },
      error: (parseError) => {
        console.error("CSV parsing error:", parseError);
        res.status(400).json({ error: 'Failed to parse CSV file.' });
      }
    });
  } catch (error) {
    console.error("Upload process error:", error);
    res.status(500).json({ error: 'An unexpected error occurred during the upload process.' });
  }
});

/**
 * ==========================================
 * Import BitLocker Key from .txt (unchanged)
 * ==========================================
 */
router.post('/:assetId/upload-bitlocker', upload.single('file'), async (req, res) => {
  if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }
  const assetId = req.params.assetId;
  const fileContent = req.file.buffer.toString('utf8');
  const originalFilename = req.file.originalname;
  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) { return res.status(404).json({ error: 'Asset not found.' }); }

    const keysToCreate = [];
    const filenameRegex = /^([A-Z])_/i;
    const filenameMatch = originalFilename.match(filenameRegex);
    const driveLetter = filenameMatch ? `${filenameMatch[1].toUpperCase()}:` : null;

    const keyRegex = /(?:\s*)?Recovery Key:\s*([\d-]+)/i;
    const keyMatch = fileContent.match(keyRegex);
    const recoveryKey = keyMatch ? keyMatch[1].replace(/\s/g, '') : null;

    if (driveLetter && recoveryKey) {
      keysToCreate.push({ assetId: assetId, drive_name: driveLetter, recovery_key: recoveryKey });
    }

    if (keysToCreate.length === 0) {
      return res.status(400).json({
        error: 'Cannot find key. Ensure filename starts with drive letter (e.g., "C_") and content includes "Recovery Key:".'
      });
    }

    const transaction = await sequelize.transaction();
    try {
      await BitlockerKey.bulkCreate(keysToCreate, { transaction, updateOnDuplicate: ["recovery_key"] });
      await transaction.commit();
      res.status(201).json({ message: `${keysToCreate.length} BitLocker key(s) imported for asset ${asset.asset_code}.` });
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }
  } catch (error) {
    console.error("Bitlocker import error:", error);
    res.status(500).json({ error: 'Failed to import BitLocker keys.', details: error.message });
  }
});

/**
 * =========================
 * [R] List assets (unchanged)
 * =========================
 */
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, filter = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { [Op.and]: [] };

    if (search) {
      whereClause[Op.and].push({
        [Op.or]: [
          { asset_code: { [Op.like]: `%${search}%` } },
          { user_name: { [Op.like]: `%${search}%` } },
          { user_id: { [Op.like]: `%${search}%` } },
          { ip_address: { [Op.like]: `%${search}%` } },
        ]
      });
    }

    if (filter === 'incomplete') {
      const assetAttributes = Object.keys(Asset.rawAttributes);
      const fieldsToCheck = assetAttributes.filter((attr) => !["id", "createdAt", "updatedAt"].includes(attr));
      const assetAttributesWithTypes = Asset.rawAttributes;

      const orConditions = fieldsToCheck.reduce((acc, field) => {
        const attributeType = assetAttributesWithTypes[field].type.constructor.name;
        acc.push({ [field]: { [Op.eq]: null } });
        if (attributeType === 'STRING' || attributeType === 'TEXT') { acc.push({ [field]: { [Op.eq]: '' } }); }
        return acc;
      }, []);

      whereClause[Op.and].push({ [Op.or]: orConditions });
    }

    if (whereClause[Op.and].length === 0) { delete whereClause[Op.and]; }

    const { count, rows } = await Asset.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      assets: rows
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

/**
 * =========================
 * [R] Get asset by id (unchanged)
 * =========================
 */
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: BitlockerKey, as: 'bitlockerKeys' },
        { model: AssetSpecialProgram, as: 'specialPrograms' }
      ]
    });
    if (asset) { res.json(asset); }
    else { res.status(404).json({ error: 'Asset not found' }); }
  } catch (error) {
    console.error(`Error fetching asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

/**
 * =========================================
 * [C] Create asset (+ license_key support)
 * =========================================
 */
router.post('/', async (req, res) => {
  const { bitlockerKeys, specialPrograms, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const newAsset = await Asset.create(assetData, { transaction });

    if (bitlockerKeys && bitlockerKeys.length > 0) {
      const keysToCreate = bitlockerKeys.map(key => ({ ...key, assetId: newAsset.id }));
      await BitlockerKey.bulkCreate(keysToCreate, { transaction });
    }

    if (specialPrograms && specialPrograms.length > 0) {
      const programsToCreate = specialPrograms
        .filter(prog => prog.program_name)
        .map(prog => ({
          program_name: prog.program_name,
          license_key: prog.license_key || null,
          assetId: newAsset.id
        }));
      if (programsToCreate.length > 0) {
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json(newAsset);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating asset:", error);
    res.status(400).json({ error: 'Failed to create asset', details: error.errors });
  }
});

/**
 * =========================================
 * [U] Update asset (+ license_key support)
 * =========================================
 */
router.put('/:id', async (req, res) => {
  const { bitlockerKeys, specialPrograms, ...assetData } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Asset not found' });
    }

    await asset.update(assetData, { transaction });

    // Replace Bitlocker keys
    await BitlockerKey.destroy({ where: { assetId: req.params.id }, transaction });
    if (bitlockerKeys && bitlockerKeys.length > 0) {
      const keysToCreate = bitlockerKeys.map(key => ({ ...key, assetId: asset.id }));
      await BitlockerKey.bulkCreate(keysToCreate, { transaction });
    }

    // Replace Special Programs
    await AssetSpecialProgram.destroy({ where: { assetId: req.params.id }, transaction });
    if (specialPrograms && specialPrograms.length > 0) {
      const programsToCreate = specialPrograms
        .filter(prog => prog.program_name)
        .map(prog => ({
          program_name: prog.program_name,
          license_key: prog.license_key || null,
          assetId: asset.id
        }));
      if (programsToCreate.length > 0) {
        await AssetSpecialProgram.bulkCreate(programsToCreate, { transaction });
      }
    }

    await transaction.commit();
    res.json(asset);
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating asset with id ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to update asset', details: error.errors });
  }
});

/**
 * =========================================================
 * [UPDATED] Replace: CREATE new asset & MOVE fields from old
 *  - สร้าง asset ใหม่ด้วย newAssetCode
 *  - ย้าย (move) ฟิลด์ที่เลือกจากเครื่องเก่า -> เครื่องใหม่ แล้วล้างค่าที่เครื่องเก่า
 *  - ย้าย Special Programs โดยอัปเดต assetId (ไม่ก็อปปี้)
 *  - ตั้งสถานะ: เก่า = 'Replaced', ใหม่ = 'In Use'
 * POST /assets/:id/replace
 * Body: {
 *   newAssetCode: string (required),
 *   fieldsToCopy?: string[]  // default: [
 *     'ip_address','wifi_registered','antivirus',
 *     'user_name','user_id','department','location',
 *     'category','subcategory','office_version','office_key',
 *     'specialPrograms'
 *   ]
 * }
 * =========================================================
 */
router.post('/:id/replace', async (req, res) => {
  const DEFAULT_FIELDS = [
    'ip_address',
    'wifi_registered',
    'antivirus',
    'user_name',
    'user_id',
    'department',
    'location',
    'category',
    'subcategory',
    'office_version',
    'office_key',
    'specialPrograms',
  ];

  const { newAssetCode, fieldsToCopy } = req.body || {};
  const fields = Array.isArray(fieldsToCopy) && fieldsToCopy.length > 0 ? fieldsToCopy : DEFAULT_FIELDS;

  // 1) validate code + normalize (ตัด space/ขีด และบังคับพิมพ์ใหญ่)
  if (!newAssetCode || !String(newAssetCode).trim()) {
    return res.status(400).json({ message: 'newAssetCode is required.' });
  }
  const normCode = String(newAssetCode).trim().toUpperCase().replace(/[\s-]+/g, '');

  const t = await sequelize.transaction();
  try {
    // 2) หา asset เดิม
    const oldAsset = await Asset.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!oldAsset) {
      await t.rollback();
      return res.status(404).json({ message: 'Old asset not found.' });
    }

    // 3) กัน asset_code ซ้ำ
    const dbNormExpr = fn('REPLACE', fn('REPLACE', fn('UPPER', col('asset_code')), ' ', ''), '-', '');
    const existed = await Asset.findOne({
      where: where(dbNormExpr, normCode),
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (existed) {
      await t.rollback();
      return res.status(409).json({ message: 'newAssetCode already exists.' });
    }

    // 4) เตรียม payload สำหรับสร้าง asset ใหม่ (ย้ายค่า scalar ไป)
    const ALLOWED_SCALAR = [
      'ip_address',
      'wifi_registered',
      'antivirus',
      'user_name',
      'user_id',
      'department',
      'location',
      'category',
      'subcategory',
      'office_version',
      'office_key',
    ];
    const createPayload = { asset_code: normCode, status: 'Enable' };
    for (const k of fields) {
      if (ALLOWED_SCALAR.includes(k)) {
        createPayload[k] = oldAsset[k] ?? null;
      }
    }

    // 5) สร้าง asset ใหม่
    const newAsset = await Asset.create(createPayload, { transaction: t });

    // 6) ย้าย Special Programs (ไม่ก็อปปี้)
    if (fields.includes('specialPrograms')) {
      const list = await AssetSpecialProgram.findAll({
        where: { assetId: oldAsset.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      for (const row of list) {
        await row.update({ assetId: newAsset.id }, { transaction: t });
      }
    }

    // (ออปชั่น) ถ้าต้องการย้าย BitLocker ด้วย ให้ปลดคอมเมนต์บล็อกนี้:
    // const keys = await BitlockerKey.findAll({
    //   where: { assetId: oldAsset.id },
    //   transaction: t,
    //   lock: t.LOCK.UPDATE,
    // });
    // for (const key of keys) {
    //   await key.update({ assetId: newAsset.id }, { transaction: t });
    // }

    // 7) ล้างค่าฟิลด์ที่ถูกย้ายออกจากเครื่องเก่า + ตั้งสถานะ 'Replaced'
    const clearPayload = {};
    for (const k of fields) {
      if (ALLOWED_SCALAR.includes(k)) {
        clearPayload[k] = null; // หรือ '' ถ้าต้อง string ว่าง
      }
    }
    clearPayload.status = 'Replaced';
    await oldAsset.update(clearPayload, { transaction: t });

    await t.commit();

    // 8) ส่งผลลัพธ์ (รวม relations)
    const refreshed = await Asset.findByPk(newAsset.id, {
      include: [
        { model: BitlockerKey, as: 'bitlockerKeys' },
        { model: AssetSpecialProgram, as: 'specialPrograms' },
      ],
    });
    return res.status(201).json({ message: 'Asset created and MOVED successfully.', newAsset: refreshed });
  } catch (err) {
    console.error('Replace (move) error:', err);
    try { await t.rollback(); } catch (_) {}
    return res.status(500).json({ message: 'Failed to move asset data.' });
  }
});

/**
 * =========================
 * [D] Delete asset (unchanged)
 * =========================
 */
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (asset) {
      await asset.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    console.error(`Error deleting asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

module.exports = router;
