const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Rack = require('./Rack');

const Location = sequelize.define(
  "Location",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "locations",
    timestamps: true,
  }
);

// สร้างความสัมพันธ์: หนึ่ง Location มีได้หลาย Rack
Location.hasMany(Rack, { foreignKey: 'locationId' });
Rack.belongsTo(Location, { foreignKey: 'locationId' });

module.exports = Location;