// it-asset-backend/models/ticket.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ticket = sequelize.define(
  "Ticket",
  {
    // PK (Sequelize จะสร้าง id: INTEGER, autoIncrement ให้โดยอัตโนมัติ)
    report_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    asset_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    reporter_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    problem_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ✅ แนบไฟล์ (ผู้ใช้ / แอดมิน) + ช่องเดิมสำหรับ fallback
    attachment_user_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    attachment_admin_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ใช้เป็นช่องเดิม/สำรอง กรณีโปรเจ็กต์เก่าเก็บไฟล์แค่ช่องเดียว",
    },

    // ส่วนของงานซ่อม
    repair_type: {
      type: DataTypes.STRING(100), // ถ้ามีชุดค่าตายตัว จะเปลี่ยนเป็น ENUM ก็ได้
      allowNull: true,
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    handler_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Request", // คงค่าเริ่มต้นเดิม
    },
  },
  {
    tableName: "tickets",
    timestamps: true, // มี createdAt / updatedAt ตามที่ DB แสดง
  }
);

module.exports = Ticket;
