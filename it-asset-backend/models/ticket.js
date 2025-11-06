const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

// ✨ แก้ไข: ใช้ชื่อไฟล์เป็นตัวพิมพ์ใหญ่ทั้งหมด (PascalCase)
const Asset = require("./Asset");
const Employee = require("./Employee");
const User = require("./User");

class Ticket extends Model {}

Ticket.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    asset_id: { type: DataTypes.INTEGER, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: true },
    corrected_email: { type: DataTypes.STRING, allowNull: true },
    internal_phone: { type: DataTypes.STRING(4), allowNull: true },
    issue_description: { type: DataTypes.TEXT, allowNull: false },
    solution: { type: DataTypes.TEXT, allowNull: true },
    issue_attachment_path: { type: DataTypes.STRING, allowNull: true },
    solution_attachment_path: { type: DataTypes.STRING, allowNull: true },
    repair_type: {
      type: DataTypes.ENUM(
        "Hardware",
        "Software",
        "Driver",
        "Install",
        "Email",
        "Setup",
        "AD_Error",
        "Network",
        "Install_Network",
        "Printer",
        "User_Error",
        "Training",
        "Virus",
        "MC_Frame",
        "AX",
        "Maintenance",
        "Therefore",
        "Location_Change",
        "Replacement",
        "Other"
      ),
      defaultValue: "Other",
    },
    handled_by: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Rejected"),
      defaultValue: "Pending",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ✨ แก้ไข: เหลือไว้แค่ belongsTo และเอา hasMany ที่อยู่ผิดที่ออก
Ticket.belongsTo(Asset, { foreignKey: "asset_id" });
Ticket.belongsTo(Employee, { foreignKey: "employee_id" });
Ticket.belongsTo(User, { as: "handler", foreignKey: "handled_by" });

module.exports = Ticket;
