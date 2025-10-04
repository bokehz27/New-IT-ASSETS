const express = require("express");
const router = express.Router();
// ✨ 1. เอา Switch และ Rack ออกจากการ import
const { Asset, Ticket, Employee, User, Category, sequelize } = require("../models");

// GET /api/dashboard/summary
router.get("/summary", async (req, res) => {
  try {
    const [
      assetCount,
      ticketCount,
      pendingCount,
      inProgressCount,
      // ✨ 2. เอานับ Switch ออก
      recentTickets,
      assetsByCategory,
    ] = await Promise.all([
      Asset.count(),
      Ticket.count(),
      Ticket.count({ where: { status: 'Pending' } }),
      Ticket.count({ where: { status: 'In Progress' } }),
      // ✨ 2. เอานับ Switch ออก
      Ticket.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          { model: Asset, attributes: ['asset_name'] },
          { model: Employee, attributes: ['name'] },
        ]
      }),
      Asset.findAll({
        attributes: [
          [sequelize.col('Category.name'), 'categoryName'],
          [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count']
        ],
        include: [{ model: Category, attributes: [] }],
        group: [sequelize.col('Category.name')],
        raw: true
      })
    ]);

    res.json({
      stats: {
        totalAssets: assetCount,
        totalTickets: ticketCount,
        pendingTickets: pendingCount,
        inProgressTickets: inProgressCount,
        // ✨ 3. เอา totalSwitches ออกจากข้อมูลที่ส่งกลับไป
      },
      recentTickets,
      assetsByCategory,
    });

  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

module.exports = router;