// models/index.js (ฉบับสมบูรณ์)

const sequelize = require('../config/database');
const Sequelize = require('sequelize');

const db = {};

// --- ✨ FIX: Import Model ทั้งหมดให้ครบถ้วน ---
db.Asset = require('./asset');
db.Category = require('./Category');
db.Subcategory = require('./Subcategory');
db.Brand = require('./Brand');
db.Model = require('./Model');
db.Ram = require('./Ram');
db.Cpu = require('./Cpu');
db.Storage = require('./Storage');
db.WindowsVersion = require('./WindowsVersion');
db.OfficeVersion = require('./OfficeVersion');
db.AntivirusProgram = require('./AntivirusProgram');
db.Employee = require('./Employee');
db.Department = require('./Department');
db.Location = require('./Location');
db.AssetStatus = require('./AssetStatus');
db.Vlan = require('./Vlan');
db.IpPool = require('./IpPool');
db.AssetIpAssignment = require('./AssetIpAssignment');
db.SpecialProgram = require('./SpecialProgram');
db.AssetSpecialProgram = require('./AssetSpecialProgram');


// --- ✨ ประกาศความสัมพันธ์ทั้งหมดที่นี่ที่เดียว ✨ ---

// --- ความสัมพันธ์ของ Master Data พื้นฐาน ---
db.Asset.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Asset.belongsTo(db.Subcategory, { foreignKey: 'subcategory_id' });
db.Asset.belongsTo(db.Brand, { foreignKey: 'brand_id' });
db.Asset.belongsTo(db.Model, { foreignKey: 'model_id' });
db.Asset.belongsTo(db.Ram, { foreignKey: 'ram_id' });
db.Asset.belongsTo(db.Cpu, { foreignKey: 'cpu_id' });
db.Asset.belongsTo(db.Storage, { foreignKey: 'storage_id' });
db.Asset.belongsTo(db.WindowsVersion, { foreignKey: 'windows_version_id' });
db.Asset.belongsTo(db.OfficeVersion, { foreignKey: 'office_version_id' });
db.Asset.belongsTo(db.AntivirusProgram, { foreignKey: 'antivirus_id' });
db.Asset.belongsTo(db.Department, { foreignKey: 'department_id' });
db.Asset.belongsTo(db.Location, { foreignKey: 'location_id' });
db.Asset.belongsTo(db.AssetStatus, { foreignKey: 'status_id' });

// --- ✨ FIX: แก้ไขความสัมพันธ์ของ Employee ให้ใช้ employee_id ---
db.Asset.belongsTo(db.Employee, { foreignKey: 'employee_id' });
db.Employee.hasMany(db.Asset, { foreignKey: 'employee_id' });

// --- ✨ ADD: เพิ่มความสัมพันธ์ของ IP Address ---
db.Asset.hasMany(db.AssetIpAssignment, { foreignKey: 'asset_id', as: 'ipAssignments' });
db.AssetIpAssignment.belongsTo(db.Asset, { foreignKey: 'asset_id' });
db.AssetIpAssignment.belongsTo(db.IpPool, { foreignKey: 'ip_id' });
db.IpPool.hasMany(db.AssetIpAssignment, { foreignKey: 'ip_id' });
db.IpPool.belongsTo(db.Vlan, { foreignKey: 'vlan_id' });
db.Vlan.hasMany(db.IpPool, { foreignKey: 'vlan_id' });


// --- ✨ ADD: เพิ่ม/แก้ไขความสัมพันธ์ของ Special Programs ---
db.Asset.hasMany(db.AssetSpecialProgram, { foreignKey: 'asset_id', as: 'specialPrograms' });
db.AssetSpecialProgram.belongsTo(db.Asset, { foreignKey: 'asset_id' });
db.AssetSpecialProgram.belongsTo(db.SpecialProgram, { foreignKey: 'program_id' });
db.SpecialProgram.hasMany(db.AssetSpecialProgram, { foreignKey: 'program_id' });

// --- จบส่วนประกาศความสัมพันธ์ ---

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;