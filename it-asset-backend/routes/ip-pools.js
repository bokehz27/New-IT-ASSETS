// routes/ip-pools.js

const express = require("express");
const router = express.Router();
const { IpPool, Vlan, AssetIpAssignment, Asset } = require("../models"); // Import จาก index.js

// GET all ip pools with assignment status
router.get("/", async (req, res) => {
  try {
    const ipPools = await IpPool.findAll({
      include: [
        { model: Vlan, attributes: ["name"] },
        {
          model: AssetIpAssignment,
          include: [{ model: Asset, attributes: ["asset_name"] }],
        },
      ],
      order: [["ip_address", "ASC"]],
    });

    const response = ipPools.map((ip) => {
      const isAssigned = ip.AssetIpAssignments && ip.AssetIpAssignments.length > 0;
      const assignment = isAssigned ? ip.AssetIpAssignments[0] : null;
      
      return {
        id: ip.id,
        ip_address: ip.ip_address,
        vlan_id: ip.vlan_id,
        // ดึงข้อมูลจาก relations มาแสดงผล
        vlan_name: ip.Vlan ? ip.Vlan.name : "N/A",
        status: isAssigned ? "Assigned" : "Available",
        assigned_asset: (assignment && assignment.Asset) ? assignment.Asset.asset_name : "-",
      };
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch IP pools" });
  }
});

// POST a new IP address
router.post("/", async (req, res) => {
  try {
    const ip = await IpPool.create(req.body);
    res.status(201).json(ip);
  } catch (error) {
    res.status(400).json({ error: "Failed to create IP address" });
  }
});

// PUT (update) an IP address
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await IpPool.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedIp = await IpPool.findByPk(req.params.id);
      res.status(200).json(updatedIp);
    } else {
      res.status(404).json({ error: "IP address not found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Failed to update IP address" });
  }
});

// DELETE an IP address
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await AssetIpAssignment.findOne({ where: { ip_id: req.params.id } });
    if (assignment) {
      return res.status(400).json({ error: "Cannot delete. This IP is currently assigned to an asset." });
    }

    const deleted = await IpPool.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "IP address not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete IP address" });
  }
});

module.exports = router;