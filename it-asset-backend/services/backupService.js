// backend/services/backupService.js
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");

const execAsync = util.promisify(exec);

const BACKUP_DIR = path.resolve(
  process.env.BACKUP_DIR || path.join(__dirname, "..", "backups")
);

// สร้างโฟลเดอร์ backup ถ้ายังไม่มี
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// สร้างคำสั่ง mysqldump
function getMysqlDumpCommand(outputPath) {
  const dumpPath = process.env.MYSQLDUMP_PATH || "mysqldump";
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || 3306; // ถ้าไม่มีใน .env จะใช้ 3306
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  if (!user || !password || !dbName) {
    throw new Error("ต้องตั้งค่า DB_USER, DB_PASSWORD, DB_NAME ใน .env ก่อน");
  }

  // ข้อสำคัญ: -p ห้ามเว้นวรรคกับ password
  return `"${dumpPath}" -h ${host} -P ${port} -u ${user} -p${password} ${dbName} > "${outputPath}"`;
}

/**
 * สร้าง backup ใหม่
 * return: { filename, size, createdAt }
 */
async function createBackup() {
  const now = new Date();

  // ตั้งชื่อไฟล์ เช่น it_assets_v2_20251209_020000.sql
  const ts = now
    .toISOString() // 2025-12-09T02:00:00.000Z
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .split(".")[0]; // 20251209_020000

  const dbName = process.env.DB_NAME || "database";
  const filename = `${dbName}_${ts}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);

  const cmd = getMysqlDumpCommand(filePath);
  await execAsync(cmd);

  const stats = fs.statSync(filePath);

  return {
    filename,
    size: stats.size,
    createdAt: stats.mtime,
  };
}

/**
 * คืนรายการ backup ทั้งหมด
 */
function listBackups() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter(
      (f) =>
        f.endsWith(".sql") ||
        f.endsWith(".sql.gz") ||
        f.endsWith(".zip")
    )
    .map((f) => {
      const full = path.join(BACKUP_DIR, f);
      const stats = fs.statSync(full);
      return {
        filename: f,
        size: stats.size,
        createdAt: stats.mtime,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return files;
}

/**
 * ลบไฟล์ backup
 */
function deleteBackup(filename) {
  const targetPath = path.join(BACKUP_DIR, filename);

  // กัน path traversal
  if (!targetPath.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error("Invalid filename");
  }

  if (!fs.existsSync(targetPath)) {
    throw new Error("File not found");
  }

  fs.unlinkSync(targetPath);
}

/**
 * path สำหรับ download
 */
function getBackupFilePath(filename) {
  const targetPath = path.join(BACKUP_DIR, filename);

  if (!targetPath.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error("Invalid filename");
  }

  if (!fs.existsSync(targetPath)) {
    throw new Error("File not found");
  }

  return targetPath;
}

module.exports = {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupFilePath,
};
