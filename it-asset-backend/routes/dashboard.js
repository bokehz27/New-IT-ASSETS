// routes/dashboard.js (แก้ไขแล้ว)

const express = require("express");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

const Asset = require("../models/Asset");
const AssetStatus = require("../models/AssetStatus");
const Category = require("../models/Category");
const Ticket = require("../models/Ticket");
const Employee = require("../models/Employee");

const router = express.Router();

Asset.belongsTo(AssetStatus, { foreignKey: "status_id" });
Asset.belongsTo(Category, { foreignKey: "category_id" });
Ticket.belongsTo(Asset, { foreignKey: "asset_id" });
Ticket.belongsTo(Employee, { foreignKey: "employee_id" });

router.get("/stats", async (req, res) => {
  try {
    const totalAssets = await Asset.count();

    // --- ✨ 1. เพิ่ม Query สำหรับนับ Asset ที่ข้อมูลไม่ครบ ---
    // (ตัวอย่าง: นับเครื่องที่ไม่มี Serial Number หรือยังไม่ได้ผูกกับผู้ใช้)
    const incompleteAssetsCount = await Asset.count({
      where: {
        [Op.or]: [
          { serial_number: { [Op.is]: null } },
          { serial_number: '' },
          { employee_id: { [Op.is]: null } },
        ]
      }
    });

    const assetsByStatus = await Asset.findAll({
      attributes: [[sequelize.fn("COUNT", sequelize.col("Asset.id")), "count"]],
      include: [{ model: AssetStatus, attributes: ['name'], required: true }],
      group: ["AssetStatus.name"],
      raw: true,
    });
    const formattedAssetsByStatus = assetsByStatus.map(item => ({ name: item['AssetStatus.name'], count: item.count }));

    const assetsByCategory = await Asset.findAll({
      attributes: [[sequelize.fn("COUNT", sequelize.col("Asset.id")), "count"]],
      include: [{ model: Category, attributes: ['name'], required: true }],
      group: ["Category.name"],
      raw: true,
    });
    const formattedAssetsByCategory = assetsByCategory.map(item => ({ name: item['Category.name'], count: item.count }));

    const recentTickets = await Ticket.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        { model: Asset, attributes: ["asset_name"] },
        { model: Employee, attributes: ["name"] },
      ],
    });

    const ticketStatusCounts = await Ticket.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status']
    });

    res.json({
      totalAssets,
      incompleteAssetsCount, // ✨ 2. ส่งข้อมูลใหม่ไปให้ Frontend
      assetsByStatus: formattedAssetsByStatus,
      assetsByCategory: formattedAssetsByCategory,
      recentTickets,
      ticketStatusCounts,
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;