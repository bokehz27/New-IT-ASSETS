// config/database.js
const { Sequelize } = require("sequelize");

// สร้าง instance ของ Sequelize
const sequelize = new Sequelize(
  "it_assets_v2", // ชื่อ Database
  "root", // User ของ Database (เปลี่ยนตามของคุณ)
  "123456", // Password ของ Database (เปลี่ยนตามของคุณ)
  {
    host: "172.18.1.61", // Host ของ Database
    dialect: "mysql", // บอก Sequelize ว่าเราใช้ MySQL
  }
);

module.exports = sequelize;
