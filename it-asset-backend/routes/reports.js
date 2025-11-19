// routes/reports.js
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const Asset = require("../models/Asset");
const AssetSpecialProgram = require("../models/AssetSpecialProgram");
const IPAddress = require("../models/AssetIpAssignment");

// --- Styling helpers (ของเดิม)
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

// ------------------------------
// Utility: build columns by field keys
// ------------------------------
const COLUMNS_MAP = {
  asset_name: { header: "IT Asset", getter: (a) => a.asset_name || "" },
  serial_number: { header: "Serial Number", getter: (a) => a.serial_number || "" },
  model: { header: "Model", getter: (a) => a.model || "" },
  category: { header: "Category", getter: (a) => a.category || "" },
  subcategory: { header: "Subcategory", getter: (a) => a.subcategory || "" },
  brand: { header: "Brand", getter: (a) => a.brand || "" },
  ram: { header: "RAM", getter: (a) => a.ram || "" },
  cpu: { header: "CPU", getter: (a) => a.cpu || "" },
  storage: { header: "Storage", getter: (a) => a.storage || "" },
  device_id: { header: "Device ID", getter: (a) => a.device_id || "" },
  mac_address_lan: { header: "MAC Address (LAN)", getter: (a) => a.mac_address_lan || "" },
  mac_address_wifi: { header: "MAC Address (WiFi)", getter: (a) => a.mac_address_wifi || "" },
  wifi_status: { header: "WiFi Status", getter: (a) => a.wifi_status || "" },
  start_date: {
    header: "Start Date",
    getter: (a) => (a.start_date ? new Date(a.start_date).toISOString().split("T")[0] : ""),
  },
  location: { header: "Location", getter: (a) => a.location || "" },
  fin_asset_ref_no: { header: "Fin Asset Ref No.", getter: (a) => a.fin_asset_ref_no || "" },
  user_id: { header: "User ID", getter: (a) => a.user_id || "" },
  user_name: { header: "User Name", getter: (a) => a.user_name || "" },
  department: { header: "Department", getter: (a) => a.department || "" },
  status: { header: "Status", getter: (a) => a.status || "" },
  ip_address: {
    header: "IP Address",
    getter: (a) => (Array.isArray(a.assignedIps) ? a.assignedIps.map((ip) => ip.ip_address).join(", ") : ""),
  },
  windows_version: { header: "Windows Version", getter: (a) => a.windows_version || "" },
  windows_product_key: { header: "Windows Key", getter: (a) => a.windows_product_key || "" },
  office_version: { header: "Office Version", getter: (a) => a.office_version || "" },
  office_product_key: { header: "Office Key", getter: (a) => a.office_product_key || "" },
  antivirus: { header: "Antivirus", getter: (a) => a.antivirus || "" },
  remark: { header: "Remark", getter: (a) => a.remark || "" },
  // ✅ ใหม่: Maintenance
  maintenance_start_date: {
    header: "Maintenance Start Date",
    getter: (a) =>
      a.maintenance_start_date
        ? new Date(a.maintenance_start_date).toISOString().split("T")[0]
        : "",
  },
  maintenance_end_date: {
    header: "Maintenance End Date",
    getter: (a) =>
      a.maintenance_end_date
        ? new Date(a.maintenance_end_date).toISOString().split("T")[0]
        : "",
  },
  maintenance_price: {
    header: "Maintenance Price",
    // ถ้าไม่มีค่า → คืน "" ไม่ใช่ N/A
    getter: (a) =>
      a.maintenance_price != null && a.maintenance_price !== ""
        ? String(a.maintenance_price)
        : "",
  },
  // ✅ ใหม่
  pa: { header: "PA", getter: (a) => a.pa || "" },
  prt: { header: "PRT", getter: (a) => a.prt || "" },
};

// ------------------------------
// GET /assets/reports/assets/export-simple
// fields=asset_name,serial_number,...&export_special_programs=true&export_bitlocker_keys=false
// ------------------------------
router.get("/assets/reports/assets/export-simple", async (req, res) => {
  try {
    const fieldsParam = (req.query.fields || "").trim();
    const exportSpecial = String(req.query.export_special_programs) === "true";
    const exportBitlocker = String(req.query.export_bitlocker_keys) === "true";

    const selectedKeys = fieldsParam
      ? fieldsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Fetch assets + relations
    const assets = await Asset.findAll({
      include: [
        { model: IPAddress, as: "assignedIps", required: false },
        { model: AssetSpecialProgram, as: "specialPrograms", required: false },
      ],
      order: [["asset_name", "ASC"]],
    });

    const wb = new ExcelJS.Workbook();

    // Main sheet
    const ws = wb.addWorksheet("Assets");
    const columns = selectedKeys.map((key) => ({
      header: (COLUMNS_MAP[key]?.header) || key,
      key,
      width: 20,
    }));
    ws.columns = columns;

    // Rows
    for (const a of assets) {
      const row = {};
      for (const key of selectedKeys) {
        const getter = COLUMNS_MAP[key]?.getter;
        row[key] = getter ? getter(a) : (a[key] ?? "");
      }
      ws.addRow(row);
    }

    applyHeaderStyles(ws);
    applyRowBorders(ws);

    // Optional: Special Programs sheet
    if (exportSpecial) {
      const wsSp = wb.addWorksheet("Special Programs");
      wsSp.columns = [
        { header: "IT Asset", key: "asset_name", width: 25 },
        { header: "Program Name", key: "program_name", width: 30 },
        { header: "License Key", key: "license_key", width: 30 },
      ];
      for (const a of assets) {
        if (Array.isArray(a.specialPrograms) && a.specialPrograms.length > 0) {
          a.specialPrograms.forEach((p) => {
            wsSp.addRow({
              asset_name: a.asset_name || "",
              program_name: p.program_name || p.name || "",
              license_key: p.license_key || "",
            });
          });
        }
      }
      applyHeaderStyles(wsSp);
      applyRowBorders(wsSp);
    }

    // Optional: BitLocker sheet (list file names if exist)
    if (exportBitlocker) {
      const wsBk = wb.addWorksheet("BitLocker Keys");
      wsBk.columns = [
        { header: "IT Asset", key: "asset_name", width: 25 },
        { header: "CSV File", key: "csv_file", width: 50 },
      ];
      for (const a of assets) {
        if (a.bitlocker_csv_file) {
          wsBk.addRow({
            asset_name: a.asset_name || "",
            csv_file: a.bitlocker_csv_file,
          });
        }
      }
      applyHeaderStyles(wsBk);
      applyRowBorders(wsBk);
    }

    // Output
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="assets_report_${new Date().toISOString().split("T")[0]}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Failed to generate report." });
  }
});

// ------------------------------
// GET /assets/reports/by-version?type=windows|office&versionId=XX&include_pa=true&include_prt=false
// หมายเหตุ: ในตาราง assets เก็บชื่อ version เป็นสตริง (เช่น 'Windows 10') 
// ฝั่ง frontend ส่ง versionId มา ⇒ ควรมี service แปลง id → name ใน layer อื่น
// ที่นี่จะรองรับทั้งเคสที่ client ส่ง name มาแทน versionId ในอนาคตได้ด้วย (param versionName)
// ------------------------------
router.get("/assets/reports/by-version", async (req, res) => {
  try {
    const type = String(req.query.type || "windows").toLowerCase(); // 'windows' or 'office'
    const versionId = req.query.versionId; // numeric/string id from UI
    const versionNameParam = req.query.versionName; // optional direct name
    const includePA = String(req.query.include_pa) === "true";
    const includePRT = String(req.query.include_prt) === "true";

    // --- Resolve version name ---
    let versionName = versionNameParam || null;

    // ถ้าฝั่งอื่นมี service แปลง versionId -> name อยู่แล้ว ให้ส่งมากับ param versionName
    // หากยังไม่มี ขอนิยาม fallback: ดึง assets ทั้งหมดแล้วกรองด้วย versionId ที่ส่งมา (ถ้ามี field version_id ใน asset)
    // โค้ดชุดนี้จะลองกรองด้วย name ก่อน (เพราะโปรเจ็กต์นี้เก็บชื่อไว้ใน asset.*_version เป็น string)
    // หากไม่มี versionName ให้ดึง assets ทั้งหมด แล้วค่อยกรองด้วย name ที่ได้จากตาราง meta ใน layer อื่น (ถ้ามี)
    // NOTE: เพื่อความปลอดภัย จะไม่ error หากหา version name ไม่ได้ แต่จะแจ้งกลับเป็น 400
    if (!versionName && !versionId) {
      return res.status(400).json({ error: "versionId or versionName is required." });
    }

    // ดึง assets ทั้งหมด
    const assetsAll = await Asset.findAll({
      include: [{ model: IPAddress, as: "assignedIps", required: false }],
    });

    // ฟิลด์เป้าหมาย
    const fieldKey = type === "office" ? "office_version" : "windows_version";

    // ถ้ามี versionName ⇒ กรองด้วยชื่อโดยตรง
    let assets = assetsAll;
    if (versionName) {
      assets = assetsAll.filter((a) => (a[fieldKey] || "").toString() === versionName.toString());
    } else {
      // ถ้าไม่มี versionName (ยังไม่ได้แมพ id เป็นชื่อในชั้นนี้) ⇒ ยอมคืน 400 เพื่อกันผลลัพธ์ผิด
      return res.status(400).json({ error: "versionName is required for now. Please pass versionName or add a mapping layer." });
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`${type === "office" ? "Office" : "Windows"} Report`);

    // คอลัมน์พื้นฐาน + เงื่อนไข PA/PRT
    const baseColumns = [
      { header: "IT Asset", key: "asset_name", width: 25 },
      { header: "Serial Number", key: "serial_number", width: 20 },
      { header: type === "office" ? "Office Version" : "Windows Version", key: "version", width: 25 },
      { header: "User", key: "user_name", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Location", key: "location", width: 20 },
      { header: "IP Address", key: "ip_address", width: 25 },
    ];

    if (includePA) baseColumns.push({ header: "PA", key: "pa", width: 15 });
    if (includePRT) baseColumns.push({ header: "PRT", key: "prt", width: 15 });

    ws.columns = baseColumns;

    for (const a of assets) {
      ws.addRow({
        asset_name: a.asset_name || "",
        serial_number: a.serial_number || "",
        version: a[fieldKey] || "",
        user_name: a.user_name || "",
        department: a.department || "",
        location: a.location || "",
        ip_address: Array.isArray(a.assignedIps) ? a.assignedIps.map(ip => ip.ip_address).join(", ") : "",
        pa: includePA ? (a.pa || "") : undefined,
        prt: includePRT ? (a.prt || "") : undefined,
      });
    }

    applyHeaderStyles(ws);
    applyRowBorders(ws);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const fileLabel = type === "office" ? "office" : "windows";
    res.setHeader("Content-Disposition", `attachment; filename="${fileLabel}_report_${new Date().toISOString().split("T")[0]}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export by version error:", err);
    res.status(500).json({ error: "Failed to generate version report." });
  }
});

module.exports = router;
