import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const settingsMenu = [
  { title: 'Asset Configuration', items: [
    { name: 'หมวดหมู่อุปกรณ์', path: '/settings/category' },
    { name: 'หมวดหมู่ย่อย', path: '/settings/subcategory' },
    { name: 'ยี่ห้อ', path: '/settings/brand' },
    { name: 'RAM', path: '/settings/ram' },
    { name: 'Harddisk', path: '/settings/storage' },
    // --- เพิ่มเมนู 'ประเภทการซ่อม' ตรงนี้ ---
    { name: 'ประเภทการซ่อม', path: '/settings/repair-type' },
    // --- สิ้นสุดการเพิ่ม ---
  ]},
  { title: 'Organization', items: [
    { name: 'แผนก', path: '/settings/department' },
    { name: 'พื้นที่ใช้งาน', path: '/settings/location' },
  ]},
  { title: 'Users', items: [
    { name: 'รายชื่อผู้ใช้', path: '/settings/user_name' },
  ]},
];

function SettingsLayout() {
  const activeLinkStyle = {
    backgroundColor: '#eff6ff', // blue-50
    color: '#1d4ed8', // blue-700
    fontWeight: '600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Menu */}
      <aside className="md:col-span-1 bg-white p-4 rounded-lg shadow-md h-fit">
        <nav className="flex flex-col space-y-4">
          {settingsMenu.map(group => (
            <div key={group.title}>
              <h3 className="px-3 py-2 text-xs font-bold uppercase text-blue-800 bg-blue-100 rounded-md tracking-wider">
                {group.title}
              </h3>
              <div className="mt-2 space-y-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                    className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Page Content */}
      <main className="md:col-span-3">
        <Outlet />
      </main>
    </div>
  );
}

export default SettingsLayout;