const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ram = sequelize.define("Ram", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  size: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "rams",
  timestamps: false
});

module.exports = Ram;
