const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MasterData = sequelize.define('MasterData', {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., category, brand, department'
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Laptop, Dell, IT'
  },
}, {
  tableName: 'master_data',
  indexes: [
    {
      unique: true,
      fields: ['type', 'value']
    }
  ]
});

module.exports = MasterData;
