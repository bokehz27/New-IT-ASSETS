// models/faq.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define(
  'Faq',
  {
    question: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pdf_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'faqs',
    timestamps: true,
  }
);

module.exports = Faq;