const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AntivirusProgram = sequelize.define("AntivirusProgram", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "antivirus_programs",
  timestamps: false
});

module.exports = AntivirusProgram;
