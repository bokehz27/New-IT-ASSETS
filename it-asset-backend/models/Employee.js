const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Department = require("./Department");
const Position = require("./Position");
const Email = require("./Email");

const Employee = sequelize.define("Employee", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  
  // ✨ เพิ่มฟิลด์ status เข้ามา
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  },

  // ✨ เพิ่ม Foreign Keys ที่ขาดไปเพื่อให้ Model สมบูรณ์
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  email_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "employees",
  timestamps: false
});

Employee.belongsTo(Department, { foreignKey: "department_id" });
Employee.belongsTo(Position, { foreignKey: "position_id" });
Employee.belongsTo(Email, { foreignKey: "email_id" });

module.exports = Employee;