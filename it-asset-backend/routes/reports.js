// routes/reports.js

const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
// --- ADD: Import all necessary models ---
const Asset = require('../models/asset');
const AssetSpecialProgram = require('../models/assetSpecialProgram');
const BitlockerKey = require('../models/bitlockerKey');

// Reusable function to apply header styling
const applyHeaderStyles = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });
};

// Reusable function to apply border to all data rows
const applyRowBorders = (worksheet) => {
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            });
        }
    });
};

router.get('/assets/export-simple', async (req, res) => {
    try {
        const { fields, export_special_programs, export_bitlocker_keys } = req.query;

        const workbook = new ExcelJS.Workbook();

        // --- SECTION 1: Main Asset Report (Sheet 1) ---
        if (fields) {
            const selectedFields = fields.split(',');
            if (selectedFields.length > 0) {
                const assets = await Asset.findAll({ raw: true });
                const worksheet = workbook.addWorksheet('Assets');

                worksheet.columns = selectedFields.map(field => ({
                    header: field, key: field, width: 25
                }));

                const rowsToAdd = assets.map(fullAsset => {
                    const rowData = {};
                    selectedFields.forEach(field => {
                        rowData[field] = fullAsset[field] || 'N/A';
                    });
                    return rowData;
                });

                worksheet.addRows(rowsToAdd);
                applyHeaderStyles(worksheet);
                applyRowBorders(worksheet);
            }
        }

        // --- SECTION 2: Special Programs Report (Sheet 2) ---
        if (export_special_programs === 'true') {
            const programs = await AssetSpecialProgram.findAll({
                include: [{
                    model: Asset,
                    as: 'asset', // Use the alias defined in association
                    attributes: ['asset_code'], // We only need asset_code
                    required: true // INNER JOIN
                }],
                order: [['assetId', 'ASC']],
            });

            const worksheet = workbook.addWorksheet('Special Programs');
            worksheet.columns = [
                { header: 'asset_code', key: 'asset_code', width: 20 },
                { header: 'program_name', key: 'program_name', width: 40 },
                { header: 'license_key', key: 'license_key', width: 40 },
            ];
            
            const rowsToAdd = programs.map(p => ({
                asset_code: p.asset.asset_code, // Access nested data
                program_name: p.program_name,
                license_key: p.license_key || 'N/A',
            }));

            worksheet.addRows(rowsToAdd);
            applyHeaderStyles(worksheet);
            applyRowBorders(worksheet);
        }

        // --- SECTION 3: BitLocker Keys Report (Sheet 3) ---
        if (export_bitlocker_keys === 'true') {
            const keys = await BitlockerKey.findAll({
                 include: [{
                    model: Asset,
                    as: 'asset', // Use the alias
                    attributes: ['asset_code'],
                    required: true
                }],
                order: [['assetId', 'ASC']],
            });

            const worksheet = workbook.addWorksheet('BitLocker Keys');
            worksheet.columns = [
                { header: 'asset_code', key: 'asset_code', width: 20 },
                { header: 'drive_name', key: 'drive_name', width: 40 },
                { header: 'recovery_key', key: 'recovery_key', width: 50 },
            ];

            const rowsToAdd = keys.map(k => ({
                asset_code: k.asset.asset_code,
                drive_name: k.drive_name,
                recovery_key: k.recovery_key,
            }));

            worksheet.addRows(rowsToAdd);
            applyHeaderStyles(worksheet);
            applyRowBorders(worksheet);
        }
        
        // Final check if any sheet was added
        if (workbook.worksheets.length === 0) {
            return res.status(400).send('No data selected for export.');
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=assets_report_complex.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting complex assets report:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;