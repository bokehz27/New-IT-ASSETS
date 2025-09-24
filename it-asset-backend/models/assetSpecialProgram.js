const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// ไม่จำเป็นต้อง require Asset ที่นี่ เพราะการกำหนดความสัมพันธ์ทำที่ไฟล์ asset.js แล้ว
// const Asset = require('./asset');

const AssetSpecialProgram = sequelize.define(
  "AssetSpecialProgram",
  {
    // ID จะถูกสร้างโดยอัตโนมัติ ไม่ต้องกำหนด
    program_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // --- (เพิ่ม) เพิ่มฟิลด์นี้เข้ามา ---
    license_key: {
      type: DataTypes.STRING,
      allowNull: true, // อนุญาตให้เป็นค่าว่างได้
    },
    // --- สิ้นสุดส่วนที่เพิ่ม ---
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "assets", // แนะนำให้ใช้ชื่อตารางเป็น String ตรงๆ
        key: "id",
      },
    },
  },
  {
    tableName: "asset_special_programs",
    timestamps: false, // ไม่ต้องใช้ createdAt, updatedAt
  }
);

module.exports = AssetSpecialProgram;
