const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Asset = require("./Asset");

const AssetSpecialProgram = sequelize.define("AssetSpecialProgram", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  program_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  license_key: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "asset_special_programs",
  timestamps: false
});

// ความสัมพันธ์กับ Asset
AssetSpecialProgram.belongsTo(Asset, { foreignKey: "asset_id" });
Asset.hasMany(AssetSpecialProgram, { foreignKey: "asset_id" });

module.exports = AssetSpecialProgram;
