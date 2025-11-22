// models/AssetCompletenessRule.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssetCompletenessRule = sequelize.define(
  "AssetCompletenessRule",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    required_fields: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const raw = this.getDataValue("required_fields");
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // เผื่อเคยเก็บเป็น comma-separated string ไว้ก่อนหน้า
          if (typeof raw === "string") {
            return raw
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
          }
          return [];
        }
      },
      set(value) {
        const toStore = Array.isArray(value) ? value : [];
        this.setDataValue("required_fields", JSON.stringify(toStore));
      },
    },
  },
  {
    tableName: "asset_completeness_rules",
    timestamps: true,
    underscored: true,
  }
);

module.exports = AssetCompletenessRule;
