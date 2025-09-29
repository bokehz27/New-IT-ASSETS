// routes/ips.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const IpPool = require("../models/IpPool");
const AssetIpAssignment = require("../models/AssetIpAssignment");

// GET /api/ips?vlan_id=1
router.get("/", async (req, res) => {
  try {
    const { vlan_id } = req.query;
    if (!vlan_id) {
      return res.status(400).json({ error: "vlan_id is required" });
    }

    const assignedIpIds = (
      await AssetIpAssignment.findAll({ attributes: ["ip_id"] })
    ).map((a) => a.ip_id);

    const availableIps = await IpPool.findAll({
      where: {
        vlan_id: vlan_id,
        id: { [Op.notIn]: assignedIpIds },
      },
      order: [["ip_address", "ASC"]],
    });

    res.json(availableIps);
  } catch (error) {
    console.error("Error fetching available IPs:", error);
    res.status(500).json({ error: "Failed to fetch available IPs" });
  }
});

module.exports = router;