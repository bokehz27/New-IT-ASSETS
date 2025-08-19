const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Asset = require('./asset');

const AssetSpecialProgram = sequelize.define(
  "AssetSpecialProgram",
  {
    program_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Asset,
        key: 'id'
      }
    }
  },
  {
    tableName: "asset_special_programs",
    timestamps: false, // ไม่ต้องใช้ createdAt, updatedAt
  }
);

module.exports = AssetSpecialProgram;