const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Email = sequelize.define("Email", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
  tableName: "emails",
  timestamps: false
});

module.exports = Email;
