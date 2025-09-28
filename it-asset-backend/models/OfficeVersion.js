const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfficeVersion = sequelize.define("OfficeVersion", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "office_versions",
  timestamps: false
});

module.exports = OfficeVersion;
