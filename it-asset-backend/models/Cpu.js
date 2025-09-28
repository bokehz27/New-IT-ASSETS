const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cpu = sequelize.define("Cpu", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "cpus",
  timestamps: false
});

module.exports = Cpu;
