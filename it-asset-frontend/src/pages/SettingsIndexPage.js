import React, { useState } from "react";
import {
  FiServer, FiBox, FiTag, FiGitMerge, FiClipboard, FiCpu,
  FiDatabase, FiHardDrive, FiTv, FiFileText, FiShield, FiStar,
  FiBriefcase, FiMapPin, FiUsers, FiMail, FiChevronsRight
} from "react-icons/fi";
import MasterDataManagement from "../components/MasterDataManagement";
import RelationalMasterDataManagement from "../components/RelationalMasterDataManagement"; // 1. Import Component เพิ่ม

// 2. ปรับโครงสร้าง Array ให้รองรับ Component สองชนิดและแก้ไขข้อมูลที่ผิด
const categories = [
  // --- MasterDataManagement (ธรรมดา) ---
  { name: "Categories", type: 'master', icon: <FiServer />, endpoint: "categories", title: "Category", colName: "Category Name" },
  { name: "Brands", type: 'master', icon: <FiTag />, endpoint: "brands", title: "Brand", colName: "Brand Name" },
  { name: "Asset Statuses", type: 'master', icon: <FiClipboard />, endpoint: "asset_statuses", title: "Asset Status", colName: "Status Name" },
  { name: "CPUs", type: 'master', icon: <FiCpu />, endpoint: "cpus", title: "CPU", colName: "CPU Name" },
  { name: "Windows Versions", type: 'master', icon: <FiTv />, endpoint: "windows_versions", title: "Windows Version", colName: "Version Name" },
  { name: "Office Versions", type: 'master', icon: <FiFileText />, endpoint: "office_versions", title: "Office Version", colName: "Version Name" },
  { name: "Antivirus", type: 'master', icon: <FiShield />, endpoint: "antivirus_programs", title: "Antivirus Program", colName: "Program Name" },
  { name: "Departments", type: 'master', icon: <FiBriefcase />, endpoint: "departments", title: "Department", colName: "Department Name" },
  { name: "Locations", type: 'master', icon: <FiMapPin />, endpoint: "locations", title: "Location", colName: "Location Name" },
  { name: "Positions", type: 'master', icon: <FiUsers />, endpoint: "positions", title: "Position", colName: "Position Name" },
  
  // --- แก้ไขข้อมูลที่ผิด ---
  { name: "RAMs", type: 'master', icon: <FiDatabase />, endpoint: "rams", title: "RAM", colKey: 'size', colName: "RAM Size" },
  { name: "Storages", type: 'master', icon: <FiHardDrive />, endpoint: "storages", title: "Storage", colKey: 'size', colName: "Storage Size" },
  { name: "Special Programs", type: 'master', icon: <FiStar />, endpoint: "special-programs", title: "Special Program", colName: "Program Name" },
  { name: "Emails", type: 'master', icon: <FiMail />, endpoint: "emails", title: "Email", colKey: 'email', colName: "Email Address" },

  // --- RelationalMasterDataManagement (แบบมีความสัมพันธ์) ---
  {
    name: "Employees",
    type: 'relational',
    icon: <FiUsers />,
    config: {
        apiEndpoint: "employees",
        title: "Employee",
        dataColumns: [
            { key: 'name', name: 'Employee Name' },
            { key: 'email_id', name: 'Email' },
            { key: 'position_id', name: 'Position' },
            { key: 'department_id', name: 'Department' }
        ],
        relations: [
            {
                apiEndpoint: 'emails',
                foreignKey: 'email_id',
                displayField: 'email', // field ที่จะแสดงใน dropdown
                label: 'Email'
            },
            {
                apiEndpoint: 'positions',
                foreignKey: 'position_id',
                displayField: 'name',
                label: 'Position'
            },
            {
                apiEndpoint: 'departments',
                foreignKey: 'department_id',
                displayField: 'name',
                label: 'Department'
            }
        ]
    }
},
  {
    name: "Subcategories",
    type: 'relational',
    icon: <FiBox />,
    config: {
      apiEndpoint: "subcategories",
      title: "Subcategory",
      dataColumns: [
        { key: 'name', name: 'Subcategory Name' },
        { key: 'category_id', name: 'Category' }
      ],
      relations: [{
        apiEndpoint: 'categories',
        foreignKey: 'category_id',
        displayField: 'name',
        label: 'Category'
      }]
    }
  },
  {
    name: "Models",
    type: 'relational',
    icon: <FiGitMerge />,
    config: {
      apiEndpoint: "models",
      title: "Model",
      dataColumns: [
        { key: 'name', name: 'Model Name' },
        { key: 'brand_id', name: 'Brand' }
      ],
      relations: [{
        apiEndpoint: 'brands',
        foreignKey: 'brand_id',
        displayField: 'name',
        label: 'Brand'
      }]
    }
  },
];

function SettingsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Settings Menu</h2>
        <div className="space-y-2">
          {categories.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedCategory(item)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedCategory?.name === item.name
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {selectedCategory ? (
          <>
            {/* 3. เพิ่มเงื่อนไขเช็ค type เพื่อเลือก Component ที่จะ Render */}
            {selectedCategory.type === 'relational' ? (
              <RelationalMasterDataManagement
                key={selectedCategory.config.apiEndpoint}
                {...selectedCategory.config}
              />
            ) : (
              <MasterDataManagement
                key={selectedCategory.endpoint}
                apiEndpoint={selectedCategory.endpoint}
                title={selectedCategory.title}
                dataColumns={[{ key: selectedCategory.colKey || 'name', name: selectedCategory.colName }]}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <FiChevronsRight className="mx-auto text-6xl text-gray-300" />
                <h1 className="mt-4 text-2xl font-bold text-gray-600">
                    Welcome to Settings
                </h1>
                <p className="text-gray-400">Please select a category from the left menu to start.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsIndexPage;