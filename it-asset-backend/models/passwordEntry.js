const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PasswordEntry = sequelize.define(
  "PasswordEntry",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "password_entries",
    timestamps: true, // createdAt / updatedAt
  }
);

module.exports = PasswordEntry;
