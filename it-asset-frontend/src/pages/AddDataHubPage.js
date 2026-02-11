import React from "react";
import { Link } from "react-router-dom";

// --- Icons (ปรับสีให้เข้ากับธีม) ---
const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-.426-1.756.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const DocumentAddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const AdjustmentsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6V4m0 16v-2m0-8v-2m0 16V4m6 6v2m6-2v2m0-8V4m-6 16v-2m-6 2v-2M4 12H2M4 6H2M4 18H2m18-6h-2m-2-6h-2m-2 6h-2m6 12v-2"
    />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
const FaqIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SupportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function AddDataHubPage() {
  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
          Data Management Hub
        </h1>
        <p className="mt-1 text-slate-500">
          Central hub for managing asset data and configuring various system
          settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Group 1: Asset Management */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] flex items-center gap-4">
            <BriefcaseIcon />
            <h2 className="text-xl font-bold text-white">Asset Management</h2>
          </div>
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/add"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <DocumentAddIcon />
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Add New Asset
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add a new IT asset to the system via form.
                  </p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
            <Link
              to="/import"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <UploadIcon />
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Import Assets from File
                  </h3>
                  <p className="text-sm text-slate-500">
                    Bulk import multiple assets by uploading a file.
                  </p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Group 2: System Settings */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] flex items-center gap-4">
            <CogIcon />
            <h2 className="text-xl font-bold text-white">System Settings</h2>
          </div>
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/settings"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <AdjustmentsIcon />
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Manage Master Data
                  </h3>
                  <p className="text-sm text-slate-500">
                    Edit form options such as category, brand, department.
                  </p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Group 3: Help & Support */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] flex items-center gap-4">
            <SupportIcon />
            <h2 className="text-xl font-bold text-white">Help & Support</h2>
          </div>
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/manage-faq"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <FaqIcon />
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Manage FAQ
                  </h3>
                  <p className="text-sm text-slate-500">
                    Create, edit, and delete frequently asked questions.
                  </p>
                </div>
              </div>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Group X: Vendor Management */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#1976d2] flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z"
              />
            </svg>

            <h2 className="text-xl font-bold text-white">Vendor Management</h2>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/vendors"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600 group-hover:text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Vendor Contacts
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage company vendors, contacts, phone numbers, and
                    updates.
                  </p>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400 group-hover:text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Group X: Database Backup */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#1565c0] flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4M3 7l9 4 9-4"
              />
            </svg>
            <h2 className="text-xl font-bold text-white">Database Backup</h2>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/backups"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600 group-hover:text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>

                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Backup Manager
                  </h3>
                  <p className="text-sm text-slate-500">
                    View, download, delete, and run database backups.
                  </p>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400 group-hover:text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Group X: Password Vault */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0d47a1] to-[#1e88e5] flex items-center gap-4">
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5
           9 6.343 9 8s1.343 3 3 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 21h14a2 2 0 002-2v-5a4 4 0 00-4-4H7a4 4 0 00-4 4v5a2 2 0 002 2z"
              />
            </svg>

            <h2 className="text-xl font-bold text-white">Password Vault</h2>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 flex-grow">
            <Link
              to="/passwords"
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-4">
                {/* Small Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600 group-hover:text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m6-6V9a6 6 0 10-12 0v2m1 10h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>

                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">
                    Manage Passwords
                  </h3>
                  <p className="text-sm text-slate-500">
                    Store department login credentials and last updated records.
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDataHubPage;
