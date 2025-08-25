const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Asset = require('../models/asset');

// กำหนดลำดับคอลัมน์ตาม asset_template.csv (รวมฟิลด์ใหม่แล้ว)
const templateFields = [
    'asset_code', 'serial_number', 'brand', 'model', 'subcategory', 'ram', 'cpu',
    'storage', 'device_id', 'ip_address', 'wifi_registered', 'mac_address_lan',
    'mac_address_wifi', 'start_date', 'location', 'fin_asset_ref', 'user_id',
    'user_name', 'department', 'category', 'status', 'windows_version',
    'windows_key', 'office_version', 'office_key', 'antivirus'
];

router.get('/assets/export-simple', async (req, res) => {
    try {
        // ใช้ templateFields ที่กำหนดไว้เสมอ
        const selectedFields = templateFields;

        const assets = await Asset.findAll({ raw: true });

        if (assets.length === 0) {
            return res.status(404).send('No asset data found.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Simple Assets Report');

        // สร้างคอลัมน์ตามลำดับของ templateFields
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

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
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