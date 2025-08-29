// routes/dashboard.js
const express = require("express");
const { Sequelize, Op } = require("sequelize");
const Asset = require("../models/asset");
const Ticket = require("../models/ticket");
const Employee = require("../models/Employee");
const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    // --- [แก้ไข] เปลี่ยนจากการเช็คแค่ 3 fields มาเป็นการเช็คทุก field แบบ Dynamic ---
    // 1. ดึงชื่อ attribute (field) ทั้งหมดของ Asset model
    const assetAttributes = Object.keys(Asset.rawAttributes);

    // 2. กรอง field ที่ไม่ต้องการตรวจสอบออก (เช่น primary key, timestamps)
    const fieldsToCheck = assetAttributes.filter(
        (attr) =>
          ![
            "id",
            //"model",
            //"category",
            //"subcategory",
            //"ram",
            //"cpu",
            //"storage",
            //"device_id",
            //"ip_address",
            //"wifi_registered",
            //"mac_address_lan",
            //"mac_address_wifi",
            //"serial_number",
            //"brand",
            //"start_date",
            //"location",
            //"fin_asset_ref",
            //"user_id",
            //"user_name",
            //"department",
            //"status",
            "createdAt",
            "updatedAt",
            "windows_version",
            "windows_key",
            "office_version",
            "office_key",
            "antivirus"
          ].includes(attr)
      );

    // 3. สร้างเงื่อนไขสำหรับ Query โดยเช็ค NULL (ทุก field) และ '' (เฉพาะ field ที่เป็นตัวอักษร)
const assetAttributesWithTypes = Asset.rawAttributes;

const orConditions = fieldsToCheck.reduce((acc, field) => {
  const attributeType = assetAttributesWithTypes[field].type.constructor.name;

  // 1. ตรวจสอบ NULL สำหรับทุกประเภท Field
  acc.push({ [field]: { [Op.eq]: null } });

  // 2. ตรวจสอบ Empty String ('') เฉพาะ Field ที่เป็นประเภท STRING หรือ TEXT
  if (attributeType === 'STRING' || attributeType === 'TEXT') {
    acc.push({ [field]: { [Op.eq]: '' } });
  }
  
  return acc;
}, []);

const incompleteAssetConditions = {
  [Op.or]: orConditions
};

    const [
      assetCount,
      ticketCount,
      inProgressCount,
      employeeCount,
      ticketsByStatus,
      assetsByCategory,
      recentTickets,
      recentAssets,
      incompleteAssetCount, // ตัวแปรยังคงชื่อเดิม
    ] = await Promise.all([
      Asset.count(),
      Ticket.count(),
      Ticket.count({ where: { status: "In Progress" } }),
      Employee.count(),
      Ticket.findAll({
        group: ["status"],
        attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
      }),
      Asset.findAll({
        group: ["category"],
        attributes: ["category", [Sequelize.fn("COUNT", "category"), "count"]],
        limit: 5,
        order: [[Sequelize.fn("COUNT", "category"), "DESC"]],
      }),
      Ticket.findAll({ limit: 5, order: [["createdAt", "DESC"]] }),
      Asset.findAll({ limit: 5, order: [["createdAt", "DESC"]] }),
      // --- ใช้เงื่อนไขที่สร้างขึ้นใหม่ในการนับ Asset ที่ข้อมูลไม่ครบ ---
      Asset.count({ where: incompleteAssetConditions }),
    ]);

    res.json({
      assetCount,
      ticketCount,
      inProgressCount,
      employeeCount,
      ticketsByStatus,
      assetsByCategory,
      recentTickets,
      recentAssets,
      incompleteAssetCount, // ส่งข้อมูลกลับไปให้ Frontend เหมือนเดิม
    });
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

module.exports = router;