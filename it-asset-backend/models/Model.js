const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Brand = require("./Brand");

const Model = sequelize.define("Model", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "models",
  timestamps: false
});

Model.belongsTo(Brand, { foreignKey: "brand_id" });
Brand.hasMany(Model, { foreignKey: "brand_id" });

module.exports = Model;
