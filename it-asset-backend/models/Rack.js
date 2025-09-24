// models/Rack.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rack = sequelize.define(
  "Rack",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true, // <-- ลบคุณสมบัตินี้ออก
    },
    location: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "racks",
    timestamps: true,
    // เพิ่มส่วนนี้เข้าไปเพื่อบอก Sequelize เกี่ยวกับ Unique Key ใหม่
    indexes: [
      {
        unique: true,
        fields: ["name", "location"],
      },
    ],
  }
);

module.exports = Rack;
