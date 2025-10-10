const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const Asset = require("../models/Asset");
const AssetSpecialProgram = require("../models/AssetSpecialProgram");
const IPAddress = require("../models/AssetIpAssignment");

// Reusable function to apply header styling
const applyHeaderStyles = (worksheet) => {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

// Reusable function to apply border to all data rows
const applyRowBorders = (worksheet) => {
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });
};



module.exports = router;
