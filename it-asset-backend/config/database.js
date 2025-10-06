const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,    // ชื่อ Database
  process.env.DB_USER,    // User ของ Database
  process.env.DB_PASSWORD, // Password ของ Database
  {
    host: process.env.DB_HOST,       // Host ของ Database
    dialect: process.env.DB_DIALECT, // บอก Sequelize ว่าเราใช้ Database อะไร
  }
);

module.exports = sequelize;