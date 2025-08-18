// models/SwitchPort.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SwitchPort = sequelize.define(
  "SwitchPort",
  {
    portNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lanCableId: {
      type: DataTypes.STRING,
    },
    // connectedTo: {  <-- ลบบรรทัดนี้
    //   type: DataTypes.STRING,
    // },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Disabled'
    },
    vlan: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    switchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: "switchports",
    timestamps: true,
  }
);

module.exports = SwitchPort;