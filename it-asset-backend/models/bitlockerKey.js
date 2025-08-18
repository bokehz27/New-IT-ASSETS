// it-asset-backend/models/bitlockerKey.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Asset = require('./asset'); // Import Asset model เพื่อใช้อ้างอิง

const BitlockerKey = sequelize.define(
  "BitlockerKey",
  {
    // ID, createdAt, updatedAt จะถูกสร้างโดย Sequelize อัตโนมัติ
    drive_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ชื่อไดรฟ์ เช่น C:, D:, E:",
    },
    recovery_key: {
      type: DataTypes.STRING(255), // Key มี 48 หลัก แต่เผื่อไว้
      allowNull: false,
      comment: "รหัส Recovery Key 48 หลัก",
    },
    assetId: { // Foreign Key ที่จะเชื่อมกับตาราง assets
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assets', // ชื่อตาราง assets
        key: 'id'
      }
    }
  },
  {
    tableName: "bitlocker_keys", // กำหนดชื่อตาราง
    timestamps: true,
  }
);

module.exports = BitlockerKey;