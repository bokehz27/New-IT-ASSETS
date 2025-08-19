import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// --- (แก้ไข) แก้ไขชื่อไอคอนให้ถูกต้องทั้งหมด ---
import {
  FiServer as Archive, // ใช้ FiServer แทน Archive
  FiBox as Box,
  FiTag as Tag,
  FiCpu as Cpu,
  FiHardDrive as HardDrive,
  FiTv as Tv,
  FiShield as ShieldCheck,
  FiTool as Wrench, // ใช้ FiTool แทน Wrench
  FiChevronRight as ChevronRight,
  FiBriefcase as Building, // FiBriefcase ถูกต้องแล้ว
  FiMapPin as MapPin,
  FiUsers as Users,
  FiKey as Key,
  FiType as Type
} from 'react-icons/fi';

const settingsMenu = [
  { 
    title: 'Asset Configuration', 
    items: [
      { name: 'หมวดหมู่อุปกรณ์', path: '/settings/category', icon: <Archive size={18} /> },
      { name: 'หมวดหมู่ย่อย', path: '/settings/subcategory', icon: <Box size={18} /> },
      { name: 'ยี่ห้อ', path: '/settings/brand', icon: <Tag size={18} /> },
      { name: 'RAM', path: '/settings/ram', icon: <Cpu size={18} /> },
      { name: 'Harddisk', path: '/settings/storage', icon: <HardDrive size={18} /> },
      { name: 'Windows', path: '/settings/windows', icon: <Tv size={18} /> },
      { name: 'Microsoft Office', path: '/settings/office', icon: <Type size={18} /> },
      { name: 'Antivirus', path: '/settings/antivirus', icon: <ShieldCheck size={18} /> },
      { name: 'โปรแกรมพิเศษ', path: '/settings/special_program', icon: <Key size={18} /> },
      { name: 'ประเภทการซ่อม', path: '/settings/repair-type', icon: <Wrench size={18} /> },
    ]
  },
  { 
    title: 'Organization', 
    items: [
      { name: 'แผนก', path: '/settings/department', icon: <Building size={18} /> },
      { name: 'พื้นที่ใช้งาน', path: '/settings/location', icon: <MapPin size={18} /> },
    ]
  },
  { 
    title: 'Users', 
    items: [
      { name: 'รายชื่อผู้ใช้', path: '/settings/user_name', icon: <Users size={18} /> },
    ]
  },
];

const AccordionItem = ({ group, openAccordion, setOpenAccordion }) => {
    const isOpen = openAccordion === group.title;
    const toggleAccordion = () => {
        setOpenAccordion(isOpen ? null : group.title);
    };

    return (
        <div className="settings-accordion-group">
            <button onClick={toggleAccordion} className="accordion-trigger">
                <span>{group.title}</span>
                <ChevronRight className={`accordion-icon ${isOpen ? 'open' : ''}`} size={20} />
            </button>
            <div 
                className="accordion-content"
                style={{ maxHeight: isOpen ? `${group.items.length * 50}px` : '0px',
                         paddingTop: isOpen ? '8px' : '0',
                         paddingBottom: isOpen ? '8px' : '0'
                }}
            >
                {group.items.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `settings-sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

function SettingsLayout() {
  const [openAccordion, setOpenAccordion] = useState('Asset Configuration');

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-72 flex-shrink-0">
        <div className="bg-white p-2 rounded-lg shadow-md h-full">
          <nav>
            {settingsMenu.map(group => (
              <AccordionItem 
                key={group.title} 
                group={group}
                openAccordion={openAccordion}
                setOpenAccordion={setOpenAccordion}
              />
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;