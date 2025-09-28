const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WindowsVersion = sequelize.define("WindowsVersion", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "windows_versions",
  timestamps: false
});

module.exports = WindowsVersion;
