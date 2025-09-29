// models/SpecialProgram.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SpecialProgram = sequelize.define( "SpecialProgram", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "special_programs", timestamps: false }
);

module.exports = SpecialProgram;