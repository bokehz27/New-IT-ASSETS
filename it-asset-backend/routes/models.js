const express = require("express");
const router = express.Router();
const Model = require("../models/Model");
const Brand = require("../models/Brand");

router.get("/", async (req, res) => {
  try {
    const data = await Model.findAll({ include: Brand });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const item = await Model.create({
      name: req.body.name,
      brand_id: req.body.brand_id
    });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    await Model.update({
      name: req.body.name,
      brand_id: req.body.brand_id
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Model.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
