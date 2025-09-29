import React from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fi";

const categories = [
  { name: "Categories", path: "/settings/category", icon: <FiServer /> },
  { name: "Subcategories", path: "/settings/subcategory", icon: <FiBox /> },
  { name: "Brands", path: "/settings/brand", icon: <FiTag /> },
  { name: "Models", path: "/settings/model", icon: <FiGitMerge /> },
  { name: "Asset Statuses", path: "/settings/asset_status", icon: <FiClipboard /> },
  { name: "CPUs", path: "/settings/cpu", icon: <FiCpu /> },
  { name: "RAMs", path: "/settings/ram", icon: <FiDatabase /> },
  { name: "Storages", path: "/settings/storage", icon: <FiHardDrive /> },
  { name: "Windows Versions", path: "/settings/windows", icon: <FiTv /> },
  { name: "Office Versions", path: "/settings/office", icon: <FiFileText /> },
  { name: "Antivirus", path: "/settings/antivirus", icon: <FiShield /> },
  { name: "Special Programs", path: "/settings/special-programs", icon: <FiStar /> },
  { name: "Departments", path: "/settings/department", icon: <FiBriefcase /> },
  { name: "Locations", path: "/settings/location", icon: <FiMapPin /> },
  { name: "Positions", path: "/settings/position", icon: <FiUsers /> },
  { name: "Employees", path: "/settings/employee", icon: <FiUsers /> },
  { name: "Emails", path: "/settings/email", icon: <FiMail /> },
];

function SettingsIndexPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Select a category to manage</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="bg-white shadow-md rounded-lg p-5 flex items-center gap-4 hover:bg-gray-50 transition"
          >
            <span className="text-indigo-500 text-xl">{item.icon}</span>
            <span className="font-medium text-gray-700">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SettingsIndexPage;
