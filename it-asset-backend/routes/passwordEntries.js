const express = require("express");
const { Op } = require("sequelize");
const PasswordEntry = require("../models/passwordEntry");

const router = express.Router();

/* GET list + search */
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};

    if (q) {
      const like = { [Op.like]: `%${q}%` };
      where[Op.or] = [
        { name: like },
        { url: like },
        { username: like },
      ];
    }

    const entries = await PasswordEntry.findAll({
      where,
      order: [["updatedAt", "DESC"]],
    });

    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch password entries" });
  }
});

/* POST create */
router.post("/", async (req, res) => {
  try {
    const { name, url, username, password } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const newEntry = await PasswordEntry.create({
      name,
      url: url || null,
      username: username || null,
      password: password || null,
    });

    res.status(201).json(newEntry);
  } catch (e) {
    res.status(500).json({ error: "Failed to create entry" });
  }
});

/* GET detail (for Edit Modal) */
router.get("/:id", async (req, res) => {
  try {
    const entry = await PasswordEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: "Password entry not found" });
    }

    res.json(entry);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch password entry" });
  }
});

/* PUT update */
router.put("/:id", async (req, res) => {
  try {
    const entry = await PasswordEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: "Not found" });

    const { name, url, username, password } = req.body;

    entry.name = name;
    entry.url = url;
    entry.username = username;
    entry.password = password;

    await entry.save();
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const entry = await PasswordEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: "Not found" });

    await entry.destroy();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

module.exports = router;
