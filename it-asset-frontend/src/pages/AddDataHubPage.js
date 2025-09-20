import React from 'react';
import { Link } from 'react-router-dom';

// --- Icons (ฉบับเต็มที่ถูกต้อง) ---
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const DocumentAddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const AdjustmentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m0 16V4m6 6v2m6-2v2m0-8V4m-6 16v-2m-6 2v-2M4 12H2M4 6H2M4 18H2m18-6h-2m-2-6h-2m-2 6h-2m6 12v-2" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const FaqIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function AddDataHubPage() {
  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Management Hub</h1>
        <p className="mt-2 text-gray-600">
          Central hub for managing asset data and configuring various system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Group 1: Asset Management */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 bg-indigo-600 flex items-center gap-4">
            <BriefcaseIcon />
            <h2 className="text-xl font-bold text-white">Asset Management</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <Link to="/add" className="flex items-center justify-between p-5 hover:bg-gray-100 transition duration-150">
              <div className="flex items-center gap-4">
                <DocumentAddIcon />
                <div>
                  <h3 className="font-semibold text-gray-800">Add New Asset</h3>
                  <p className="text-sm text-gray-500">Add a new IT asset to the system via form.</p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
            <Link to="/import" className="flex items-center justify-between p-5 hover:bg-gray-100 transition duration-150">
              <div className="flex items-center gap-4">
                <UploadIcon />
                <div>
                  <h3 className="font-semibold text-gray-800">Import Assets from File</h3>
                  <p className="text-sm text-gray-500">Bulk import multiple assets by uploading a file.</p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Group 2: System Settings */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 bg-gray-700 flex items-center gap-4">
            <CogIcon />
            <h2 className="text-xl font-bold text-white">System Settings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <Link to="/settings/category" className="flex items-center justify-between p-5 hover:bg-gray-100 transition duration-150">
              <div className="flex items-center gap-4">
                <AdjustmentsIcon />
                <div>
                  <h3 className="font-semibold text-gray-800">Manage Master Data</h3>
                  <p className="text-sm text-gray-500">Edit form options such as category, brand, department.</p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Group 3: Help & Support (New Card) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 bg-teal-600 flex items-center gap-4">
            <SupportIcon />
            <h2 className="text-xl font-bold text-white">Help & Support</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <Link to="/manage-faq" className="flex items-center justify-between p-5 hover:bg-gray-100 transition duration-150">
              <div className="flex items-center gap-4">
                <FaqIcon />
                <div>
                  <h3 className="font-semibold text-gray-800">Manage FAQ</h3>
                  <p className="text-sm text-gray-500">Create, edit, and delete frequently asked questions.</p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AddDataHubPage;