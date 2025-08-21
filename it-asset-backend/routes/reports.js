const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Asset = require('../models/asset');

router.get('/assets/export-simple', async (req, res) => {
    try {
        const { fields } = req.query;
        if (!fields) {
            return res.status(400).send('Please select fields to export.');
        }
        const selectedFields = fields.split(',');

        const assets = await Asset.findAll({ raw: true });

        if (assets.length === 0) {
            return res.status(404).send('No asset data found.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Simple Assets Report');

        worksheet.columns = selectedFields.map(field => ({
            header: field,
            key: field,
            width: 25
        }));

        const rowsToAdd = assets.map(fullAsset => {
            const rowData = {};
            selectedFields.forEach(field => {
                rowData[field] = fullAsset[field] || 'N/A';
            });
            return rowData;
        });

        worksheet.addRows(rowsToAdd);

        // --- DECORATION SECTION (FINAL REVISION) ---

        const headerRow = worksheet.getRow(1);
        headerRow.height = 20;

        // ใช้วิธีวนลูปตามจำนวนคอลัมน์ที่แน่นอน เพื่อเจาะจงใส่สไตล์ทีละเซลล์
        // This is a more robust method to prevent style "spilling"
        for (let i = 1; i <= selectedFields.length; i++) {
            const cell = headerRow.getCell(i);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }

        // ตีเส้นตารางสำหรับข้อมูล (ส่วนนี้ทำงานถูกต้องแล้ว)
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                // วนลูปตามจำนวนคอลัมน์ที่มีอยู่จริง เพื่อความแม่นยำ
                 for (let i = 1; i <= selectedFields.length; i++) {
                     const cell = row.getCell(i);
                     cell.border = {
                         top: { style: 'thin' },
                         left: { style: 'thin' },
                         bottom: { style: 'thin' },
                         right: { style: 'thin' }
                     };
                }
            }
        });

        // --- END DECORATION SECTION ---

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