// models/asset.js (แก้ไขแล้ว)

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Asset = sequelize.define("Asset", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  asset_name: { type: DataTypes.STRING, allowNull: true },
  user_id: { type: DataTypes.STRING, allowNull: true }, 
  employee_id: { type: DataTypes.INTEGER, allowNull: true },
  serial_number: { type: DataTypes.STRING, allowNull: true },
  device_id: { type: DataTypes.STRING, allowNull: true },
  mac_address_lan: { type: DataTypes.STRING, allowNull: true },
  mac_address_wifi: { type: DataTypes.STRING, allowNull: true },
  wifi_status: { type: DataTypes.STRING, allowNull: true },
  windows_product_key: { type: DataTypes.STRING, allowNull: true },
  office_product_key: { type: DataTypes.STRING, allowNull: true },
  bitlocker_csv_file: { type: DataTypes.STRING, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  fin_asset_ref_no: { type: DataTypes.STRING, allowNull: true },
  remark: { type: DataTypes.TEXT, allowNull: true },
  category_id: { type: DataTypes.INTEGER, allowNull: true },
  subcategory_id: { type: DataTypes.INTEGER, allowNull: true },
  brand_id: { type: DataTypes.INTEGER, allowNull: true },
  model_id: { type: DataTypes.INTEGER, allowNull: true },
  ram_id: { type: DataTypes.INTEGER, allowNull: true },
  cpu_id: { type: DataTypes.INTEGER, allowNull: true },
  storage_id: { type: DataTypes.INTEGER, allowNull: true },
  windows_version_id: { type: DataTypes.INTEGER, allowNull:true },
  office_version_id: { type: DataTypes.INTEGER, allowNull: true },
  antivirus_id: { type: DataTypes.INTEGER, allowNull: true },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
  location_id: { type: DataTypes.INTEGER, allowNull: true },
  status_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: "assets",
  timestamps: true 
});



module.exports = Asset;