const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Asset = require('../models/asset');

// +++ FINAL ROBUST ROUTE: Fetches full records and selects data in JS +++
router.get('/assets/export-simple', async (req, res) => {
    try {
        const { fields } = req.query;
        if (!fields) {
            return res.status(400).send('Please select fields to export.');
        }
        const selectedFields = fields.split(',');

        // 1. ดึงข้อมูลทั้งหมดทุกคอลัมน์จากตาราง assets
        //    วิธีนี้จะปล่อยให้ Sequelize จัดการเรื่องชื่อคอลัมน์เอง
        const assets = await Asset.findAll({ raw: true });

        if (assets.length === 0) {
            return res.status(404).send('No asset data found.');
        }

        // 2. เตรียมไฟล์ Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Simple Assets Report');

        // 3. สร้าง Headers จากชื่อฟิลด์ที่ผู้ใช้เลือกมา
        worksheet.columns = selectedFields.map(field => ({
            header: field,
            key: field,
            width: 25
        }));

        // 4. สร้างข้อมูลสำหรับแต่ละแถว โดยเลือกเฉพาะข้อมูลที่ต้องการจาก object ที่ดึงมา
        const rowsToAdd = assets.map(fullAsset => {
            const rowData = {};
            selectedFields.forEach(field => {
                // เลือกค่าจาก fullAsset object โดยใช้ key ที่ตรงกับที่ Frontend ส่งมา
                rowData[field] = fullAsset[field] || 'N/A';
            });
            return rowData;
        });

        worksheet.addRows(rowsToAdd);

        // 5. ส่งไฟล์ให้ Client
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=assets_simple_report.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting simple assets report:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;