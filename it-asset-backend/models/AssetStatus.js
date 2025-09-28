const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AssetStatus = sequelize.define("AssetStatus", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "asset_statuses",
  timestamps: false,
});

module.exports = AssetStatus;
