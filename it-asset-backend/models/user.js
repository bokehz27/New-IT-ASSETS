const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// ไม่ต้อง import Ticket ที่นี่

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // ไม่ต้องมี role ถ้าฐานข้อมูลไม่มี
  },
  {
    tableName: "users",
  }
);

// ไม่ต้องมี User.hasMany ที่นี่

module.exports = User;