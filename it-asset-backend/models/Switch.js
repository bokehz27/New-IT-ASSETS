// models/Switch.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Rack = require('./Rack');
const SwitchPort = require('./SwitchPort');

const Switch = sequelize.define(
  "Switch",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING,
    },
    model: {
      type: DataTypes.STRING,
    },
    // serial_number: { type: DataTypes.STRING }, // <-- ลบออก
    port_count: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0 
    },
    rackId: { // <-- เพิ่ม allowNull: false
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: "switches",
    timestamps: true,
  }
);

// Associations (ความสัมพันธ์) เหมือนเดิม
Switch.belongsTo(Rack, { foreignKey: 'rackId' });
Rack.hasMany(Switch, { foreignKey: 'rackId' });

Switch.hasMany(SwitchPort, { foreignKey: 'switchId' });
SwitchPort.belongsTo(Switch, { foreignKey: 'switchId' });

module.exports = Switch;