// models/AssetIpAssignment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssetIpAssignment = sequelize.define(
  "AssetIpAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "asset_ip_assignments",
    timestamps: false, // ตารางนี้ไม่มี createdAt และ updatedAt
  }
);

module.exports = AssetIpAssignment;