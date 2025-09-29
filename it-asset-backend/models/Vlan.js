// models/Vlan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vlan = sequelize.define(
  "Vlan",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vlan_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    site: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "vlans",
    timestamps: false, // ตารางนี้ไม่มี createdAt และ updatedAt
  }
);

module.exports = Vlan;