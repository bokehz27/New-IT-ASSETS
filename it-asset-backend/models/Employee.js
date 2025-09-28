const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Department = require("./Department");
const Position = require("./Position");
const Email = require("./Email");

const Employee = sequelize.define("Employee", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "employees",
  timestamps: false
});

Employee.belongsTo(Department, { foreignKey: "department_id" });
Employee.belongsTo(Position, { foreignKey: "position_id" });
Employee.belongsTo(Email, { foreignKey: "email_id" });

module.exports = Employee;
