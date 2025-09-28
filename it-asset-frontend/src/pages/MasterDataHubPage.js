// src/pages/MasterDataHubPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { CogIcon, UsersIcon, DesktopComputerIcon, LocationMarkerIcon, BriefcaseIcon, ShieldCheckIcon, CodeIcon, ChipIcon } from '@heroicons/react/outline';

const masterDataLinks = [
  // Asset Info
  { path: '/manage/asset-statuses', title: 'Asset Statuses', icon: CogIcon },
  { path: '/manage/categories', title: 'Categories', icon: CogIcon },
  { path: '/manage/subcategories', title: 'Subcategories', icon: CogIcon },
  { path: '/manage/brands', title: 'Brands', icon: CogIcon },
  { path: '/manage/models', title: 'Models', icon: CogIcon },
  // Hardware
  { path: '/manage/cpus', title: 'CPUs', icon: ChipIcon },
  { path: '/manage/rams', title: 'RAMs', icon: ChipIcon },
  { path: '/manage/storages', title: 'Storages', icon: ChipIcon },
  // Software
  { path: '/manage/windows-versions', title: 'Windows Versions', icon: DesktopComputerIcon },
  { path: '/manage/office-versions', title: 'Office Versions', icon: DesktopComputerIcon },
  { path: '/manage/antivirus', title: 'Antivirus', icon: ShieldCheckIcon },
  { path: '/manage/special-programs', title: 'Special Programs', icon: CodeIcon },
  // Personnel & Location
  { path: '/manage/employees', title: 'Employees', icon: UsersIcon },
  { path: '/manage/emails', title: 'Emails', icon: UsersIcon },
  { path: '/manage/departments', title: 'Departments', icon: BriefcaseIcon },
  { path: '/manage/positions', title: 'Positions', icon: BriefcaseIcon },
  { path: '/manage/locations', title: 'Locations', icon: LocationMarkerIcon },
];

const MasterDataHubPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Master Data Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {masterDataLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            <link.icon className="h-8 w-8 mb-2 text-gray-500 group-hover:text-white" />
            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 group-hover:text-white">{link.title}</h5>
            <p className="font-normal text-gray-700 group-hover:text-white">Manage {link.title} data.</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MasterDataHubPage;