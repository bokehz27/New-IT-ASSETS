// cron.js
const cron = require("node-cron");
const { createBackup } = require("./services/backupService");

// ตั้งให้ backup ทุกวันเวลา 02:00
cron.schedule("0 2 * * *", async () => {
  console.log("[CRON] Starting automatic backup...");
  try {
    const result = await createBackup();
    console.log("[CRON] Backup completed:", result.filename);
  } catch (err) {
    console.error("[CRON] Backup failed:", err);
  }
});
