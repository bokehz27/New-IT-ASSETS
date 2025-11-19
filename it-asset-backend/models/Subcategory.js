const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Subcategory = sequelize.define(
  "Subcategory",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "subcategories",
    timestamps: false,
  }
);

// ❌ ลบ belongsTo / hasMany ออกจากไฟล์นี้ทั้งหมด
// เพราะ category_id ไม่มีแล้ว

module.exports = Subcategory;
