// models/IpPool.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const IpPool = sequelize.define(
  "IpPool",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vlan_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // หรือ false หากบังคับว่า IP ต้องมี VLAN เสมอ
    },
  },
  {
    tableName: "ip_pools",
    timestamps: false, // ตารางนี้ไม่มี createdAt และ updatedAt
  }
);

module.exports = IpPool;