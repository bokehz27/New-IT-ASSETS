const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Position = sequelize.define("Position", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
  tableName: "positions",
  timestamps: false
});

module.exports = Position;
