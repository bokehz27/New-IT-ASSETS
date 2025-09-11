import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// Import icons from react-icons
import {
  FiServer as Archive,
  FiBox as Box,
  FiTag as Tag,
  FiCpu as Cpu,
  FiHardDrive as HardDrive,
  FiTv as Tv,
  FiShield as ShieldCheck,
  FiTool as Wrench,
  FiBriefcase as Building,
  FiMapPin as MapPin,
  FiUsers as Users,
  FiKey as Key,
  FiType as Type
} from 'react-icons/fi';

// Define the menu structure
const settingsMenu = [
  {
    title: 'Asset Configuration',
    items: [
      { name: 'Asset Category', path: '/settings/category', icon: <Archive /> },
      { name: 'Subcategory', path: '/settings/subcategory', icon: <Box /> },
      { name: 'Brand', path: '/settings/brand', icon: <Tag /> },
      { name: 'RAM', path: '/settings/ram', icon: <Cpu /> },
      { name: 'Hard Disk', path: '/settings/storage', icon: <HardDrive /> },
      { name: 'Windows', path: '/settings/windows', icon: <Tv /> },
      { name: 'Microsoft Office', path: '/settings/office', icon: <Type /> },
      { name: 'Antivirus', path: '/settings/antivirus', icon: <ShieldCheck /> },
      { name: 'Special Program', path: '/settings/special_program', icon: <Key /> },
      { name: 'Repair Type', path: '/settings/repair-type', icon: <Wrench /> },
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Department', path: '/settings/department', icon: <Building /> },
      { name: 'Location', path: '/settings/location', icon: <MapPin /> },
      { name: 'User List', path: '/settings/users', icon: <Users /> },
    ]
  },
];

function SettingsLayout() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="md:w-72 flex-shrink-0">
        <nav className="settings-sidebar h-full">
          {settingsMenu.map((group) => (
            // Use React.Fragment to group elements without adding extra nodes to the DOM
            <React.Fragment key={group.title}>
              <h3 className="settings-menu-group-title">
                {group.title}
              </h3>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `settings-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;