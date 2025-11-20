// pages/SettingsIndexPage.js

import React, { useState } from "react";
import {
  FiServer,
  FiBox,
  FiTag,
  FiGitMerge,
  FiClipboard,
  FiCpu,
  FiDatabase,
  FiHardDrive,
  FiTv,
  FiFileText,
  FiShield,
  FiStar,
  FiBriefcase,
  FiMapPin,
  FiUsers,
  FiMail,
  FiChevronsRight,
  FiChevronDown,
  FiGitBranch,
  FiMap, // 1. เพิ่มไอคอนใหม่
} from "react-icons/fi";
import MasterDataManagement from "../components/MasterDataManagement";
import RelationalMasterDataManagement from "../components/RelationalMasterDataManagement";

// 2. อัปเดตโครงสร้าง config ทั้งหมด
const groupedCategories = [
  {
    groupName: "Asset Information",
    items: [
      {
        name: "Categories",
        type: "master",
        icon: <FiServer />,
        endpoint: "categories",
        title: "Category",
        dataColumns: [{ key: "name", name: "Category Name" }],
      },
      {
        name: "Subcategories",
        type: "relational",
        icon: <FiBox />,
        config: {},
      },
      {
        name: "Brands",
        type: "master",
        icon: <FiTag />,
        endpoint: "brands",
        title: "Brand",
        dataColumns: [{ key: "name", name: "Brand Name" }],
      },
      { name: "Models", type: "relational", icon: <FiGitMerge />, config: {} },
      {
        name: "Asset Statuses",
        type: "master",
        icon: <FiClipboard />,
        endpoint: "asset_statuses",
        title: "Asset Status",
        dataColumns: [{ key: "name", name: "Status Name" }],
      },
    ],
  },
  {
    groupName: "Hardware & Software",
    items: [
      {
        name: "CPUs",
        type: "master",
        icon: <FiCpu />,
        endpoint: "cpus",
        title: "CPU",
        dataColumns: [{ key: "name", name: "CPU Name" }],
      },
      {
        name: "RAMs",
        type: "master",
        icon: <FiDatabase />,
        endpoint: "rams",
        title: "RAM",
        dataColumns: [{ key: "size", name: "RAM Size" }],
      },
      {
        name: "Storages",
        type: "master",
        icon: <FiHardDrive />,
        endpoint: "storages",
        title: "Storage",
        dataColumns: [{ key: "size", name: "Storage Size" }],
      },
      {
        name: "Windows Versions",
        type: "master",
        icon: <FiTv />,
        endpoint: "windows_versions",
        title: "Windows Version",
        dataColumns: [{ key: "name", name: "Version Name" }],
      },
      {
        name: "Office Versions",
        type: "master",
        icon: <FiFileText />,
        endpoint: "office_versions",
        title: "Office Version",
        dataColumns: [{ key: "name", name: "Version Name" }],
      },
      {
        name: "Antivirus",
        type: "master",
        icon: <FiShield />,
        endpoint: "antivirus_programs",
        title: "Antivirus Program",
        dataColumns: [{ key: "name", name: "Program Name" }],
      },
      {
        name: "Special Programs",
        type: "master",
        icon: <FiStar />,
        endpoint: "special-programs",
        title: "Special Program",
        dataColumns: [{ key: "name", name: "Program Name" }],
      },
    ],
  },
  {
    groupName: "Personnel & Location",
    items: [
      {
        name: "Departments",
        type: "master",
        icon: <FiBriefcase />,
        endpoint: "departments",
        title: "Department",
        dataColumns: [{ key: "name", name: "Department Name" }],
      },
      {
        name: "Locations",
        type: "master",
        icon: <FiMapPin />,
        endpoint: "locations",
        title: "Location",
        dataColumns: [{ key: "name", name: "Location Name" }],
      },
      {
        name: "Positions",
        type: "master",
        icon: <FiUsers />,
        endpoint: "positions",
        title: "Position",
        dataColumns: [{ key: "name", name: "Position Name" }],
      },
      { name: "Employees", type: "relational", icon: <FiUsers />, config: {} },
      {
        name: "Emails",
        type: "master",
        icon: <FiMail />,
        endpoint: "emails",
        title: "Email",
        dataColumns: [{ key: "email", name: "Email Address" }],
      },
    ],
  },
  {
    groupName: "Network & IP",
    items: [
      {
        name: "VLANs",
        type: "master",
        icon: <FiGitBranch />,
        endpoint: "vlans",
        title: "VLAN",
        dataColumns: [
          { key: "name", name: "VLAN Name" },
          { key: "vlan_number", name: "VLAN Number" },
          { key: "site", name: "Site / Location" },
        ],
      },
{
  name: "IP Pools",
  type: "relational",
  icon: <FiMap />,
  config: {
    apiEndpoint: "ip-pools",
    title: "IP Address Pool",
    dataColumns: [
      { key: "ip_address", name: "IP Address" },
      { key: "vlan_id", name: "VLAN" },
    ],
    relations: [
      {
        apiEndpoint: "vlans",
        foreignKey: "vlan_id",
        // แก้ตรงนี้จาก "name" ให้เป็นฟังก์ชัน
        displayField: (item) => `${item.name} - ${item.site}`,
        label: "VLAN",
      },
    ],
  },
},
    ],
  },
];

const findItem = (name) => {
  for (const group of groupedCategories) {
    const item = group.items.find((i) => i.name === name);
    if (item) return item;
  }
  return {};
};

findItem("Subcategories").config = {
  apiEndpoint: "subcategories",
  title: "Subcategory",
  dataColumns: [
    { key: "name", name: "Subcategory Name" },
  ],
  // relations ไม่ต้องมีแล้ว เพราะไม่มี category_id
};

findItem("Models").config = {
  apiEndpoint: "models",
  title: "Model",
  dataColumns: [
    { key: "name", name: "Model Name" },
    { key: "brand_id", name: "Brand" },
  ],
  relations: [
    {
      apiEndpoint: "brands",
      foreignKey: "brand_id",
      displayField: "name",
      label: "Brand",
    },
  ],
};
findItem("Employees").config = {
  apiEndpoint: "employees",
  title: "Employee",
  dataColumns: [
    { key: "name", name: "Employee Name" },
    { key: "email_id", name: "Email" },
    { key: "position_id", name: "Position" },
    { key: "department_id", name: "Department" },
    { key: "status", name: "Status" },
  ],
  relations: [
    {
      apiEndpoint: "emails",
      foreignKey: "email_id",
      displayField: "email",
      label: "Email",
    },
    {
      apiEndpoint: "positions",
      foreignKey: "position_id",
      displayField: "name",
      label: "Position",
    },
    {
      apiEndpoint: "departments",
      foreignKey: "department_id",
      displayField: "name",
      label: "Department",
    },
  ],
};

function SettingsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openGroup, setOpenGroup] = useState("Asset Information");

  const handleGroupClick = (groupName) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Settings Menu
        </h2>
        <div className="space-y-1">
          {groupedCategories.map((group) => (
            <div key={group.groupName}>
              <button
                onClick={() => handleGroupClick(group.groupName)}
                className="w-full flex justify-between items-center p-3 rounded-lg text-left font-semibold text-gray-700 hover:bg-gray-100"
              >
                <span>{group.groupName}</span>
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    openGroup === group.groupName ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openGroup === group.groupName && (
                <div className="pl-4 pt-1 pb-2 space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setSelectedCategory(item)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors text-sm ${
                        selectedCategory?.name === item.name
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-100"
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

      <div className="flex-1 p-8 overflow-y-auto">
        {selectedCategory ? (
          <>
            {selectedCategory.type === "relational" ? (
              <RelationalMasterDataManagement
                key={selectedCategory.config.apiEndpoint}
                {...selectedCategory.config}
              />
            ) : (
              // 3. อัปเดตการส่ง props ให้ยืดหยุ่นขึ้น
              <MasterDataManagement
                key={selectedCategory.endpoint}
                apiEndpoint={selectedCategory.endpoint}
                title={selectedCategory.title}
                dataColumns={selectedCategory.dataColumns}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiChevronsRight className="mx-auto text-6xl text-gray-300" />
              <h1 className="mt-4 text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
                Welcome to Settings
              </h1>
              <p className="text-gray-400">
                Please select a category from the left menu to start.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsIndexPage;
