// models/AssetSpecialProgram.js (Final)

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Model นี้ไม่จำเป็นต้องรู้จัก Asset อีกต่อไป เพราะเราจะจัดการความสัมพันธ์ที่ models/index.js
const AssetSpecialProgram = sequelize.define("AssetSpecialProgram", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true // สามารถเป็น NULL ได้ ถ้ามันคือ Master Data ของชื่อโปรแกรม
  },
  program_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  license_key: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "asset_special_programs",
  timestamps: false
});

module.exports = AssetSpecialProgram;