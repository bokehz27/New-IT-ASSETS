// models/vendor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    last_contact_date: {
      type: DataTypes.DATEONLY, // เก็บเป็น yyyy-mm-dd
      allowNull: true,
    },
  },
  {
    tableName: "vendors",
    timestamps: true, // มี createdAt / updatedAt
  }
);

module.exports = Vendor;
