// it-asset-backend/models/asset.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const BitlockerKey = require("./bitlockerKey");
const AssetSpecialProgram = require("./assetSpecialProgram");

// หมายเหตุ:
// - เก็บชนิดเดิมของบางฟิลด์ตามสคีมาปัจจุบัน (เช่น wifi_registered = STRING)
// - เพิ่ม unique + hook normalize ให้ asset_code
// - ระบุ allowNull ให้ชัดเจน

const Asset = sequelize.define(
  "Asset",
  {
    asset_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    serial_number: { type: DataTypes.STRING, allowNull: true },
    brand: { type: DataTypes.STRING, allowNull: true },
    model: { type: DataTypes.STRING, allowNull: true },

    // หมวดหมู่ (ใช้ใน Replace)
    category: { type: DataTypes.STRING, allowNull: true },
    subcategory: { type: DataTypes.STRING, allowNull: true },

    // สเปกฮาร์ดแวร์
    ram: { type: DataTypes.STRING, allowNull: true },
    cpu: { type: DataTypes.STRING, allowNull: true },
    storage: { type: DataTypes.STRING, allowNull: true },
    device_id: { type: DataTypes.STRING, allowNull: true },

    // เครือข่าย (ใช้ใน Replace)
    ip_address: { type: DataTypes.STRING, allowNull: true },
    wifi_registered: { type: DataTypes.STRING, allowNull: true }, // คงชนิดเดิมเพื่อหลีกเลี่ยง migration

    mac_address_lan: { type: DataTypes.STRING, allowNull: true },
    mac_address_wifi: { type: DataTypes.STRING, allowNull: true },

    // ข้อมูลการใช้งาน (ใช้ใน Replace)
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    fin_asset_ref: { type: DataTypes.STRING, allowNull: true },
    user_id: { type: DataTypes.STRING, allowNull: true },
    user_name: { type: DataTypes.STRING, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },

    // สถานะ
    status: { type: DataTypes.STRING, allowNull: true, defaultValue: "Enable" },

    // License/Software (ใช้ใน Replace)
    windows_version: { type: DataTypes.STRING, allowNull: true },
    windows_key: { type: DataTypes.STRING, allowNull: true },
    office_version: { type: DataTypes.STRING, allowNull: true }, // Microsoft Office
    office_key: { type: DataTypes.STRING, allowNull: true },     // Office Product Key
    antivirus: { type: DataTypes.STRING, allowNull: true },

    // 🆕 เพิ่มฟิลด์สำหรับเก็บไฟล์ CSV ของ BitLocker
    bitlocker_file_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "assets",
    hooks: {
      beforeValidate(instance) {
        if (instance.asset_code) {
          instance.asset_code = String(instance.asset_code)
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "");
        }
      },
    },
    indexes: [
      // เร่งความเร็วการค้นหาตาม code และกันซ้ำระดับ DB
      { unique: true, fields: ["asset_code"] },
    ],
  }
);

// ความสัมพันธ์ BitLocker
Asset.hasMany(BitlockerKey, {
  foreignKey: "assetId",
  as: "bitlockerKeys",
  onDelete: "CASCADE",
});
BitlockerKey.belongsTo(Asset, {
  foreignKey: "assetId",
  as: "asset",
});

// ความสัมพันธ์ Special Programs
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
