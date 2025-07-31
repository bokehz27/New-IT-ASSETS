const express = require('express');
const { Op } = require('sequelize');
const multer = require('multer'); // 1. Import multer
const Papa = require('papaparse'); // 2. Import papaparse
const Asset = require('../models/asset'); // ตรวจสอบว่า path ไปยัง model ถูกต้อง
const router = express.Router();

// --- 3. ตั้งค่า Multer ให้อ่านไฟล์ใน Memory ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- 4. เพิ่ม Route ใหม่สำหรับจัดการไฟล์ Upload ---
// POST /api/assets/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const csvData = req.file.buffer.toString('utf8');

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const assetsToCreate = results.data.map(row => {
            for (const key in row) {
              if (row[key] === '' || row[key] === 'N/A') {
                row[key] = null;
              }
            }
            if (row.start_date && !Date.parse(row.start_date)) {
                row.start_date = null;
            }
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


// [R]ead: ดึงข้อมูลทั้งหมด (พร้อม Pagination, Search, และ Filter)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, filter = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.and]: []
    };

    // 1. เพิ่มเงื่อนไข Search (ถ้ามี)
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

    // 2. เพิ่มเงื่อนไข Filter (ถ้ามี)
    if (filter === 'incomplete') {
  const assetAttributes = Object.keys(Asset.rawAttributes);
  const fieldsToCheck = assetAttributes.filter(
    (attr) => !["id", "createdAt", "updatedAt"].includes(attr)
  );
  const assetAttributesWithTypes = Asset.rawAttributes;

  const orConditions = fieldsToCheck.reduce((acc, field) => {
    const attributeType = assetAttributesWithTypes[field].type.constructor.name;

    // 1. ตรวจสอบ NULL สำหรับทุกประเภท Field
    acc.push({ [field]: { [Op.eq]: null } });

    // 2. ตรวจสอบค่าว่าง ('') เฉพาะ Field ที่เป็นตัวอักษร
    if (attributeType === 'STRING' || attributeType === 'TEXT') {
      acc.push({ [field]: { [Op.eq]: '' } });
    }

    return acc;
  }, []);

  whereClause[Op.and].push({ [Op.or]: orConditions });
}

    if (whereClause[Op.and].length === 0) {
      delete whereClause[Op.and];
    }

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

// [R]ead: ดึงข้อมูลตาม ID (ส่วนที่เพิ่มเข้ามา)
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (asset) {
      res.json(asset);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    console.error(`Error fetching asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// [C]reate: สร้าง Asset ใหม่
router.post('/', async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(400).json({ error: 'Failed to create asset', details: error.errors });
  }
});

// [U]pdate: อัปเดตข้อมูล Asset
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (asset) {
      await asset.update(req.body);
      res.json(asset);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
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
      res.status(204).send(); // 204 No Content
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    console.error(`Error deleting asset with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

module.exports = router;