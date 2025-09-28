import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// Import icons from react-icons
import {
  FiServer,
  FiBox,
  FiTag,
  FiCpu,
  FiHardDrive,
  FiTv,
  FiShield,
  FiFileText,
  FiBriefcase,
  FiMapPin,
  FiUsers,
  FiClipboard,
  FiMail,
  FiDatabase,
  FiGitMerge
} from 'react-icons/fi';

// Define the new menu structure for Master Data
const masterDataMenu = [
  {
    title: 'Asset Information',
    items: [
      { name: 'Categories', path: '/settings/category', icon: <FiServer /> },
      { name: 'Subcategories', path: '/settings/subcategory', icon: <FiBox /> },
      { name: 'Brands', path: '/settings/brand', icon: <FiTag /> },
      { name: 'Models', path: '/settings/model', icon: <FiGitMerge /> },
      { name: 'Asset Statuses', path: '/settings/asset_status', icon: <FiClipboard /> },
    ]
  },
  {
    title: 'Hardware Components',
    items: [
      { name: 'CPUs', path: '/settings/cpu', icon: <FiCpu /> },
      { name: 'RAMs', path: '/settings/ram', icon: <FiDatabase /> },
      { name: 'Storages', path: '/settings/storage', icon: <FiHardDrive /> },
    ]
  },
  {
    title: 'Software & Security',
    items: [
      { name: 'Windows Versions', path: '/settings/windows', icon: <FiTv /> },
      { name: 'Office Versions', path: '/settings/office', icon: <FiFileText /> },
      { name: 'Antivirus', path: '/settings/antivirus', icon: <FiShield /> },
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Departments', path: '/settings/department', icon: <FiBriefcase /> },
      { name: 'Locations', path: '/settings/location', icon: <FiMapPin /> },
      { name: 'Positions', path: '/settings/position', icon: <FiUsers /> },
      { name: 'Employees', path: '/settings/employee', icon: <FiUsers /> },
      { name: 'Emails', path: '/settings/email', icon: <FiMail /> },
    ]
  },
];

function SettingsLayout() {
  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        </div>
        <nav className="flex-grow p-2">
          {masterDataMenu.map((group) => (
            <div key={group.title} className="mb-4">
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mt-1 text-sm text-gray-600 rounded-md hover:bg-gray-100 ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                    }`
                  }
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet /> 
      </main>
    </div>
  );
}

export default SettingsLayout;