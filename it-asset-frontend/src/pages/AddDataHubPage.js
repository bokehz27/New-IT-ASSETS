import React from 'react';
import { Link } from 'react-router-dom';

// ไอคอนสำหรับใช้ในการ์ด (เป็น SVG component)
const AssetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

function AddDataHubPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Data Management</h2>
      <p className="text-gray-600 mb-8">Manage primary data and configure system options from this hub.</p>
      
      {/* Section 1: Primary Data Management */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Manage Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-lg bg-blue-500 flex items-center justify-center mb-4"><AssetIcon /></div>
              <h4 className="text-lg font-semibold text-gray-800">Add New Asset</h4>
              <p className="mt-1 text-gray-500 text-sm">Add a single new IT asset to the inventory using a detailed form.</p>
            </div>
            <Link to="/add" className="mt-4 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
              Add Manually
            </Link>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-lg bg-purple-500 flex items-center justify-center mb-4"><AssetIcon /></div>
              <h4 className="text-lg font-semibold text-gray-800">Import Assets</h4>
              <p className="mt-1 text-gray-500 text-sm">Add multiple assets at once by uploading a CSV file.</p>
            </div>
            <Link to="/import" className="mt-4 text-center bg-purple-500 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-600 transition duration-300">
              Import from File
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: System Settings / Master Data */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">System Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center mb-4"><SettingsIcon /></div>
              <h4 className="text-lg font-semibold text-gray-800">Manage Options</h4>
              <p className="mt-1 text-gray-500 text-sm">Configure the dropdown options used in forms, such as brands, departments, and asset categories.</p>
            </div>
            <Link to="/settings/category" className="mt-4 text-center bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300">
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDataHubPage;
