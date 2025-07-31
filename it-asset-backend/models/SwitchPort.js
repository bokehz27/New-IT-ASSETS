// models/switchPort.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SwitchPort = sequelize.define(
  "SwitchPort",
  {
    // Sequelize จะจัดการ id, createdAt, updatedAt อัตโนมัติ
    // assetId จะถูกสร้างผ่าน association

    portNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'portNumber' // ระบุให้ตรงกับชื่อคอลัมน์
    },
    lanCableId: {
      type: DataTypes.STRING,
      field: 'lanCableId' // ตรงกับคอลัมน์ของคุณ
    },
    vlan: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING // หรือ ENUM ถ้าต้องการ
    },
    connectedTo: {
      type: DataTypes.STRING, // ตรงกับ description ที่เคยแนะนำไป
      field: 'connectedTo'
    },
    notes: {
      type: DataTypes.TEXT // สำหรับข้อความยาวๆ
    }
  },
  {
    tableName: "switchports", // ระบุชื่อตารางให้ตรง
  }
);

module.exports = SwitchPort;