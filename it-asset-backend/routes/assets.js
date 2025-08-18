const express = require('express');
const { Op } = require('sequelize');
const multer = require('multer');
const Papa = require('papaparse');
const Asset = require('../models/asset');
const BitlockerKey = require('../models/bitlockerKey');
const sequelize = require('../config/database');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route สำหรับ Upload CSV (ไม่มีการเปลี่ยนแปลง)
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }
    try {
        const csvData = req.file.buffer.toString('utf8');
        Papa.parse(csvData, {
            header: true, skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const assetsToCreate = results.data.map(row => {
                        for (const key in row) { if (row[key] === '' || row[key] === 'N/A') { row[key] = null; } }
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

// --- (แก้ไขล่าสุด) Route สำหรับ Import BitLocker Key จากไฟล์ .txt ---
router.post('/:assetId/upload-bitlocker', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const assetId = req.params.assetId;
    const fileContent = req.file.buffer.toString('utf8');
    const originalFilename = req.file.originalname;

    try {
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found.' });
        }

        const keysToCreate = [];

        // 1. ดึงชื่อ Drive จากชื่อไฟล์ (เช่น "C_" จาก "C_Bitlocker....txt")
        const filenameRegex = /^([A-Z])_/i;
        const filenameMatch = originalFilename.match(filenameRegex);
        const driveLetter = filenameMatch ? `${filenameMatch[1].toUpperCase()}:` : null;

        // 2. (ปรับปรุง Regex) ดึง Recovery Key จากเนื้อหาในไฟล์ โดยไม่สนใจ 
        const keyRegex = /(?:\\s*)?Recovery Key:\s*([\d-]+)/i;
        const keyMatch = fileContent.match(keyRegex);
        const recoveryKey = keyMatch ? keyMatch[1].replace(/\s/g, '') : null;

        if (driveLetter && recoveryKey) {
            keysToCreate.push({
                assetId: assetId,
                drive_name: driveLetter,
                recovery_key: recoveryKey,
            });
        }

        if (keysToCreate.length === 0) {
            return res.status(400).json({ error: 'Cannot find key. Ensure filename starts with drive letter (e.g., "C_") and content includes "Recovery Key:".' });
        }

        const transaction = await sequelize.transaction();
        try {
            await BitlockerKey.bulkCreate(keysToCreate, {
                transaction,
                updateOnDuplicate: ["recovery_key"]
            });
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


// [R]ead: ดึงข้อมูลทั้งหมด
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 20, filter = '' } = req.query;
        const offset = (page - 1) * limit;
        const whereClause = { [Op.and]: [] };
        if (search) {
            whereClause[Op.and].push({
                [Op.or]: [
                    { asset_code: { [Op.like]: `%${search}%` } }, { user_name: { [Op.like]: `%${search}%` } },
                    { user_id: { [Op.like]: `%${search}%` } }, { ip_address: { [Op.like]: `%${search}%` } },
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
            where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['updatedAt', 'DESC']]
        });
        res.json({
            totalItems: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), assets: rows
        });
    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// [R]ead: ดึงข้อมูลตาม ID
router.get('/:id', async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id, { include: [{ model: BitlockerKey, as: 'bitlockerKeys' }] });
        if (asset) { res.json(asset); } else { res.status(404).json({ error: 'Asset not found' }); }
    } catch (error) {
        console.error(`Error fetching asset with id ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch asset' });
    }
});

// [C]reate: สร้าง Asset ใหม่
router.post('/', async (req, res) => {
    const { bitlockerKeys, ...assetData } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const newAsset = await Asset.create(assetData, { transaction });
        if (bitlockerKeys && bitlockerKeys.length > 0) {
            const keysToCreate = bitlockerKeys.map(key => ({ ...key, assetId: newAsset.id }));
            await BitlockerKey.bulkCreate(keysToCreate, { transaction });
        }
        await transaction.commit();
        res.status(201).json(newAsset);
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating asset:", error);
        res.status(400).json({ error: 'Failed to create asset', details: error.errors });
    }
});

// [U]pdate: อัปเดตข้อมูล Asset
router.put('/:id', async (req, res) => {
    const { bitlockerKeys, ...assetData } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const asset = await Asset.findByPk(req.params.id);
        if (asset) {
            await asset.update(assetData, { transaction });
            await BitlockerKey.destroy({ where: { assetId: req.params.id }, transaction });
            if (bitlockerKeys && bitlockerKeys.length > 0) {
                const keysToCreate = bitlockerKeys.map(key => ({ ...key, assetId: asset.id }));
                await BitlockerKey.bulkCreate(keysToCreate, { transaction });
            }
            await transaction.commit();
            res.json(asset);
        } else {
            await transaction.rollback();
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error(`Error updating asset with id ${req.params.id}:`, error);
        res.status(400).json({ error: 'Failed to update asset', details: error.errors });
    }
});

// [D]elete: ลบ Asset
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