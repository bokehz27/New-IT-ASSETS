const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// import master models
const Category = require("./Category");
const Subcategory = require("./Subcategory");
const Brand = require("./Brand");
const Model = require("./Model");
const Ram = require("./Ram");
const Cpu = require("./Cpu");
const Storage = require("./Storage");
const WindowsVersion = require("./WindowsVersion");
const OfficeVersion = require("./OfficeVersion");
const AntivirusProgram = require("./AntivirusProgram");
const Department = require("./Department");
const Location = require("./Location");
const Employee = require("./Employee");
const AssetStatus = require("./AssetStatus");

const Asset = sequelize.define("Asset", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  asset_name: { type: DataTypes.STRING, allowNull: true },
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
  remark: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: "assets",
  timestamps: false
});

// Associations
Asset.belongsTo(Category, { foreignKey: "category_id" });
Asset.belongsTo(Subcategory, { foreignKey: "subcategory_id" });
Asset.belongsTo(Brand, { foreignKey: "brand_id" });
Asset.belongsTo(Model, { foreignKey: "model_id" });
Asset.belongsTo(Ram, { foreignKey: "ram_id" });
Asset.belongsTo(Cpu, { foreignKey: "cpu_id" });
Asset.belongsTo(Storage, { foreignKey: "storage_id" });
Asset.belongsTo(WindowsVersion, { foreignKey: "windows_version_id" });
Asset.belongsTo(OfficeVersion, { foreignKey: "office_version_id" });
Asset.belongsTo(AntivirusProgram, { foreignKey: "antivirus_id" });
Asset.belongsTo(Employee, { foreignKey: "user_id" });
Asset.belongsTo(Department, { foreignKey: "department_id" });
Asset.belongsTo(Location, { foreignKey: "location_id" });
Asset.belongsTo(AssetStatus, { foreignKey: "status_id" });

module.exports = Asset;
