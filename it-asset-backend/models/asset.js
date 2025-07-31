// it-asset-backend/models/asset.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SwitchPort = require("./SwitchPort");
const Asset = sequelize.define(
  "Asset",
  {
    // ไม่ต้องกำหนด id, createdAt, updatedAt เพราะ Sequelize จัดการให้
    asset_code: { type: DataTypes.STRING }, // 1. รหัสอุปกรณ์
    serial_number: { type: DataTypes.STRING }, // 2. หมายเลขซีเรียล
    brand: { type: DataTypes.STRING }, // 3. ยี่ห้ออุปกรณ์
    model: { type: DataTypes.STRING }, // 4. รุ่นอุปกรณ์
    subcategory: { type: DataTypes.STRING }, // 5. หมวดหมู่ย่อย
    ram: { type: DataTypes.STRING }, // 6. หน่วยความจำ (แรม)
    cpu: { type: DataTypes.STRING }, // 7. ซีพียู
    storage: { type: DataTypes.STRING }, // 8. ฮาร์ดดิสก์
    device_id: { type: DataTypes.STRING }, // 9. Device ID
    ip_address: { type: DataTypes.STRING }, // 10. IP Address
    wifi_registered: { type: DataTypes.STRING }, // 11. Wifi Register
    mac_address_lan: { type: DataTypes.STRING }, // 12. Mac Address - LAN
    mac_address_wifi: { type: DataTypes.STRING }, // 13. Mac Address - WiFi
    start_date: { type: DataTypes.DATEONLY }, // 14. วันที่เริ่มใช้งาน
    location: { type: DataTypes.STRING }, // 15. พื้นที่ใช้งาน
    fin_asset_ref: { type: DataTypes.STRING }, // 16. Ref. FIN Asset No.
    user_id: { type: DataTypes.STRING }, // 17. User ID
    user_name: { type: DataTypes.STRING }, // 18. ชื่อ - นามสกุล
    department: { type: DataTypes.STRING }, // 19. หน่วยงาน / แผนก
    category: { type: DataTypes.STRING }, // 20. หมวดหมู่อุปกรณ์

    status: { type: DataTypes.STRING, defaultValue: "Enable" }, // field เก่าที่ยังใช้อยู่
  },
  {
    tableName: "assets", // ระบุให้ตรงกับชื่อตารางของเรา
  }
);
Asset.hasMany(SwitchPort, {
  foreignKey: "assetId", // คีย์นอกในตาราง switchports
  as: "ports", // ชื่อเรียกเมื่อ include ข้อมูล
});

// SwitchPort หนึ่งพอร์ต เป็นของ Asset (สวิตช์) แค่ตัวเดียว
SwitchPort.belongsTo(Asset, {
  foreignKey: "assetId",
});
module.exports = Asset;
