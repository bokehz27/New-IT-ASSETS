// backend/routes/backups.js
const express = require("express");
const router = express.Router();

const {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupFilePath,
} = require("../services/backupService");


// GET /api/backups - list backups
router.get("/", (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (err) {
    console.error("Error listing backups:", err);
    res.status(500).json({ message: "Failed to list backups" });
  }
});

// POST /api/backups/run - create new backup now
router.post("/run", async (req, res) => {
  try {
    const result = await createBackup();
    res.status(201).json({
      message: "Backup created",
      backup: result,
    });
  } catch (err) {
    console.error("Error creating backup:", err);
    res.status(500).json({ message: "Failed to create backup" });
  }
});

// GET /api/backups/:filename/download - download backup file
router.get("/:filename/download", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = getBackupFilePath(filename);
    res.download(filePath, filename);
  } catch (err) {
    console.error("Error downloading backup:", err);
    res.status(404).json({ message: "File not found" });
  }
});

// DELETE /api/backups/:filename - delete backup
router.delete("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    deleteBackup(filename);
    res.json({ message: "Backup deleted" });
  } catch (err) {
    console.error("Error deleting backup:", err);
    res.status(400).json({ message: err.message || "Failed to delete" });
  }
});

module.exports = router;
