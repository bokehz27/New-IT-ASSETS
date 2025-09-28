// models/index.js (สร้างไฟล์ใหม่)

const sequelize = require('../config/database');

// Import Model ทุกตัวเข้ามา
const Asset = require('./asset');
const AssetSpecialProgram = require('./AssetSpecialProgram');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Brand = require('./Brand');
const Model = require('./Model');
const Ram = require('./Ram');
const Cpu = require('./Cpu');
const Storage = require('./Storage');
const WindowsVersion = require('./WindowsVersion');
const OfficeVersion = require('./OfficeVersion');
const AntivirusProgram = require('./AntivirusProgram');
const Employee = require('./Employee');
const Department = require('./Department');
const Location = require('./Location');
const AssetStatus = require('./AssetStatus');

// --- สร้างความสัมพันธ์ (Associations) ทั้งหมดที่นี่ ---

// Asset <-> AssetSpecialProgram (One-to-Many)
Asset.hasMany(AssetSpecialProgram, { as: 'specialPrograms', foreignKey: 'asset_id' });
AssetSpecialProgram.belongsTo(Asset, { foreignKey: 'asset_id' });

// Asset <-> Master Data (Many-to-One)
Asset.belongsTo(Category, { foreignKey: 'category_id' });
Asset.belongsTo(Subcategory, { foreignKey: 'subcategory_id' });
Asset.belongsTo(Brand, { foreignKey: 'brand_id' });
Asset.belongsTo(Model, { foreignKey: 'model_id' });
Asset.belongsTo(Ram, { foreignKey: 'ram_id' });
Asset.belongsTo(Cpu, { foreignKey: 'cpu_id' });
Asset.belongsTo(Storage, { foreignKey: 'storage_id' });
Asset.belongsTo(WindowsVersion, { foreignKey: 'windows_version_id' });
Asset.belongsTo(OfficeVersion, { foreignKey: 'office_version_id' });
Asset.belongsTo(AntivirusProgram, { foreignKey: 'antivirus_id' });
Asset.belongsTo(Employee, { foreignKey: 'user_id' });
Asset.belongsTo(Department, { foreignKey: 'department_id' });
Asset.belongsTo(Location, { foreignKey: 'location_id' });
Asset.belongsTo(AssetStatus, { foreignKey: 'status_id' });

// ----------------------------------------------------

const models = {
  sequelize,
  Asset,
  AssetSpecialProgram,
  Category,
  Subcategory,
  Brand,
  Model,
  Ram,
  Cpu,
  Storage,
  WindowsVersion,
  OfficeVersion,
  AntivirusProgram,
  Employee,
  Department,
  Location,
  AssetStatus
};

module.exports = models;