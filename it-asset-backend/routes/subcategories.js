const express = require("express");
const router = express.Router();
const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  try {
    const data = await Subcategory.findAll({ include: Category });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const item = await Subcategory.create({
      name: req.body.name,
      category_id: req.body.category_id
    });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    await Subcategory.update({
      name: req.body.name,
      category_id: req.body.category_id
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Subcategory.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
