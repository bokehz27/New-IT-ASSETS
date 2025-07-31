// models/ticket.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  report_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  asset_code: { type: DataTypes.STRING },
  reporter_name: { type: DataTypes.STRING, allowNull: false },
  contact_phone: { type: DataTypes.STRING },
  problem_description: { type: DataTypes.TEXT, allowNull: false },
  attachment_url: { type: DataTypes.STRING },
  solution: { type: DataTypes.TEXT },
  handler_name: { type: DataTypes.STRING },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Request', // สถานะเริ่มต้น
  },
  // เพิ่ม field ใหม่สำหรับประเภทการซ่อม
  repair_type: {
    type: DataTypes.STRING, // หรือ DataTypes.ENUM ถ้ามีประเภทที่แน่นอน
    allowNull: true, // อนุญาตให้เป็นค่าว่างได้
  }
}, {
  tableName: 'tickets'
});

module.exports = Ticket;