// it-asset-backend/models/asset.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const BitlockerKey = require("./bitlockerKey");
const AssetSpecialProgram = require("./assetSpecialProgram"); // --- (เพิ่ม) เพิ่มบรรทัดนี้เข้ามา ---

const Asset = sequelize.define(
  "Asset",
  {
    asset_code: { type: DataTypes.STRING },
    serial_number: { type: DataTypes.STRING },
    brand: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    subcategory: { type: DataTypes.STRING },
    ram: { type: DataTypes.STRING },
    cpu: { type: DataTypes.STRING },
    storage: { type: DataTypes.STRING },
    device_id: { type: DataTypes.STRING },
    ip_address: { type: DataTypes.STRING },
    wifi_registered: { type: DataTypes.STRING },
    mac_address_lan: { type: DataTypes.STRING },
    mac_address_wifi: { type: DataTypes.STRING },
    start_date: { type: DataTypes.DATEONLY },
    location: { type: DataTypes.STRING },
    fin_asset_ref: { type: DataTypes.STRING },
    user_id: { type: DataTypes.STRING },
    user_name: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "Enable" },
    windows_version: { type: DataTypes.STRING },
    windows_key: { type: DataTypes.STRING },

    office_version: { type: DataTypes.STRING },
    office_key: { type: DataTypes.STRING },
    antivirus: { type: DataTypes.STRING },
    // special_programs ถูกลบออกไปแล้ว ถูกต้องครับ
  },
  {
    tableName: "assets",
  }
);

// ความสัมพันธ์เดิมของ Bitlocker
Asset.hasMany(BitlockerKey, {
  foreignKey: "assetId",
  as: "bitlockerKeys",
  onDelete: "CASCADE",
});
BitlockerKey.belongsTo(Asset, {
  foreignKey: "assetId",
  as: "asset",
});

// ความสัมพันธ์สำหรับ Special Programs
Asset.hasMany(AssetSpecialProgram, {
  foreignKey: "assetId",
  as: "specialPrograms",
  onDelete: "CASCADE",
});
AssetSpecialProgram.belongsTo(Asset, {
  foreignKey: "assetId",
  as: "asset",
});

module.exports = Asset;