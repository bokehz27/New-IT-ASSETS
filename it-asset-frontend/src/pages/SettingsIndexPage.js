import React, { useState } from "react";
import {
  FiServer, FiBox, FiTag, FiGitMerge, FiClipboard, FiCpu,
  FiDatabase, FiHardDrive, FiTv, FiFileText, FiShield, FiStar,
  FiBriefcase, FiMapPin, FiUsers, FiMail, FiChevronsRight, FiChevronDown
} from "react-icons/fi";
import MasterDataManagement from "../components/MasterDataManagement";
import RelationalMasterDataManagement from "../components/RelationalMasterDataManagement";

// ✨ 1. จัดโครงสร้างข้อมูลใหม่ให้เป็นกลุ่ม
const groupedCategories = [
  {
    groupName: "Asset Information",
    items: [
      { name: "Categories", type: 'master', icon: <FiServer />, endpoint: "categories", title: "Category", colName: "Category Name" },
      { name: "Subcategories", type: 'relational', icon: <FiBox />, config: { /* ... config ... */ } },
      { name: "Brands", type: 'master', icon: <FiTag />, endpoint: "brands", title: "Brand", colName: "Brand Name" },
      { name: "Models", type: 'relational', icon: <FiGitMerge />, config: { /* ... config ... */ } },
      { name: "Asset Statuses", type: 'master', icon: <FiClipboard />, endpoint: "asset_statuses", title: "Asset Status", colName: "Status Name" },
    ]
  },
  {
    groupName: "Hardware & Software",
    items: [
      { name: "CPUs", type: 'master', icon: <FiCpu />, endpoint: "cpus", title: "CPU", colName: "CPU Name" },
      { name: "RAMs", type: 'master', icon: <FiDatabase />, endpoint: "rams", title: "RAM", colKey: 'size', colName: "RAM Size" },
      { name: "Storages", type: 'master', icon: <FiHardDrive />, endpoint: "storages", title: "Storage", colKey: 'size', colName: "Storage Size" },
      { name: "Windows Versions", type: 'master', icon: <FiTv />, endpoint: "windows_versions", title: "Windows Version", colName: "Version Name" },
      { name: "Office Versions", type: 'master', icon: <FiFileText />, endpoint: "office_versions", title: "Office Version", colName: "Version Name" },
      { name: "Antivirus", type: 'master', icon: <FiShield />, endpoint: "antivirus_programs", title: "Antivirus Program", colName: "Program Name" },
      { name: "Special Programs", type: 'master', icon: <FiStar />, endpoint: "special-programs", title: "Special Program", colName: "Program Name" },
    ]
  },
  {
    groupName: "Personnel & Location",
    items: [
      { name: "Departments", type: 'master', icon: <FiBriefcase />, endpoint: "departments", title: "Department", colName: "Department Name" },
      { name: "Locations", type: 'master', icon: <FiMapPin />, endpoint: "locations", title: "Location", colName: "Location Name" },
      { name: "Positions", type: 'master', icon: <FiUsers />, endpoint: "positions", title: "Position", colName: "Position Name" },
      { name: "Employees", type: 'relational', icon: <FiUsers />, config: { /* ... config ... */ } },
      { name: "Emails", type: 'master', icon: <FiMail />, endpoint: "emails", title: "Email", colKey: 'email', colName: "Email Address" },
    ]
  }
];

// (ผมย้าย config ที่ยาวๆ มาไว้ตรงนี้เพื่อให้อ่านง่ายขึ้น)
const findItem = (name) => {
    for (const group of groupedCategories) {
        const item = group.items.find(i => i.name === name);
        if (item) return item;
    }
    return {};
};

findItem('Subcategories').config = {
  apiEndpoint: "subcategories",
  title: "Subcategory",
  dataColumns: [{ key: 'name', name: 'Subcategory Name' }, { key: 'category_id', name: 'Category' }],
  relations: [{ apiEndpoint: 'categories', foreignKey: 'category_id', displayField: 'name', label: 'Category' }]
};
findItem('Models').config = {
  apiEndpoint: "models",
  title: "Model",
  dataColumns: [{ key: 'name', name: 'Model Name' }, { key: 'brand_id', name: 'Brand' }],
  relations: [{ apiEndpoint: 'brands', foreignKey: 'brand_id', displayField: 'name', label: 'Brand' }]
};
findItem('Employees').config = {
  apiEndpoint: "employees",
  title: "Employee",
  dataColumns: [{ key: 'name', name: 'Employee Name' }, { key: 'email_id', name: 'Email' }, { key: 'position_id', name: 'Position' }, { key: 'department_id', name: 'Department' },
    { key: 'status', name: 'Status' }],
  relations: [
    { apiEndpoint: 'emails', foreignKey: 'email_id', displayField: 'email', label: 'Email' },
    { apiEndpoint: 'positions', foreignKey: 'position_id', displayField: 'name', label: 'Position' },
    { apiEndpoint: 'departments', foreignKey: 'department_id', displayField: 'name', label: 'Department' }
  ]
};


function SettingsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  // ✨ 2. เพิ่ม State สำหรับจัดการการเปิด-ปิดเมนู
  const [openGroup, setOpenGroup] = useState('Asset Information'); // เปิดเมนูกลุ่มแรกเป็นค่าเริ่มต้น

  const handleGroupClick = (groupName) => {
    setOpenGroup(openGroup === groupName ? null : groupName); // ถ้ากดซ้ำให้ปิด, ถ้ากดอันใหม่ให้เปิด
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Settings Menu</h2>
        {/* ✨ 3. สร้างเมนูแบบกลุ่ม (Accordion) */}
        <div className="space-y-1">
          {groupedCategories.map((group) => (
            <div key={group.groupName}>
              {/* --- Header ของกลุ่ม --- */}
              <button
                onClick={() => handleGroupClick(group.groupName)}
                className="w-full flex justify-between items-center p-3 rounded-lg text-left font-semibold text-gray-700 hover:bg-gray-100"
              >
                <span>{group.groupName}</span>
                <FiChevronDown className={`transition-transform duration-200 ${openGroup === group.groupName ? 'rotate-180' : ''}`} />
              </button>

              {/* --- รายการเมนูในกลุ่ม (จะแสดงเมื่อกลุ่มถูกเปิด) --- */}
              {openGroup === group.groupName && (
                <div className="pl-4 pt-1 pb-2 space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setSelectedCategory(item)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors text-sm ${
                        selectedCategory?.name === item.name
                          ? 'bg-indigo-500 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- ส่วนแสดงผลด้านขวา (ไม่มีการเปลี่ยนแปลง) --- */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedCategory ? (
          <>
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