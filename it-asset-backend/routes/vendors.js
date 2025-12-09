// routes/vendors.js
const express = require("express");
const { Op } = require("sequelize");
const Vendor = require("../models/vendor");

const router = express.Router();

// GET /api/vendors  (list + search)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};

    if (q) {
      const like = { [Op.like]: `%${q}%` };
      where[Op.or] = [
        { company_name: like },
        { vendor_name: like },
        { contact_detail: like },
        { phone_number: like },
      ];
    }

    const vendors = await Vendor.findAll({
      where,
      order: [["updatedAt", "DESC"]],
    });

    res.json(vendors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// GET /api/vendors/:id  (detail)
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// POST /api/vendors  (create)
router.post("/", async (req, res) => {
  try {
    const { company_name, vendor_name, contact_detail, phone_number, last_contact_date } = req.body;

    if (!company_name) {
      return res.status(400).json({ error: "company_name is required" });
    }

    const newVendor = await Vendor.create({
      company_name,
      vendor_name: vendor_name || null,
      contact_detail: contact_detail || null,
      phone_number: phone_number || null,
      last_contact_date: last_contact_date || null,
    });

    res.status(201).json(newVendor);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create vendor", details: e.message });
  }
});

// PUT /api/vendors/:id  (update)
router.put("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const { company_name, vendor_name, contact_detail, phone_number, last_contact_date } = req.body;

    if (!company_name) {
      return res.status(400).json({ error: "company_name is required" });
    }

    vendor.company_name = company_name;
    vendor.vendor_name = vendor_name || null;
    vendor.contact_detail = contact_detail || null;
    vendor.phone_number = phone_number || null;
    vendor.last_contact_date = last_contact_date || null;

    await vendor.save();
    res.json(vendor);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update vendor", details: e.message });
  }
});

// DELETE /api/vendors/:id  (delete)
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    await vendor.destroy();
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

module.exports = router;
