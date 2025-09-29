// models/AssetSpecialProgram.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssetSpecialProgram = sequelize.define( "AssetSpecialProgram", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    asset_id: { type: DataTypes.INTEGER, allowNull: false },
    program_id: { type: DataTypes.INTEGER, allowNull: false },
    license_key: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "asset_special_programs", timestamps: false }
);

module.exports = AssetSpecialProgram;