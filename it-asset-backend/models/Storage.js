const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Storage = sequelize.define("Storage", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  size: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "storages",
  timestamps: false
});

module.exports = Storage;
