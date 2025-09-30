// src/components/AssetList.js
import React from "react";
import { Link } from "react-router-dom";
// ... Icon imports remain the same ...
import { FaLaptop, FaServer, FaHdd, FaBoxOpen } from "react-icons/fa";
// ...

const AssetIcon = ({ category }) => {
  // ... This component's logic remains the same ...
};

function AssetList({ assets, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-blue-600">
          <tr>
            <th className="p-3 font-semibold text-white">Picture</th>
            <th className="p-3 font-semibold text-white">Categories</th>
            <th className="p-3 font-semibold text-white">Asset Name</th>
            <th className="p-3 font-semibold text-white">Subcategories</th>
            <th className="p-3 font-semibold text-white">Department</th>
            <th className="p-3 font-semibold text-white">Device Users</th>
            <th className="p-3 font-semibold text-white">User ID</th>
            <th className="p-3 font-semibold text-white text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="p-2 align-middle">
                  <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-md">
                    <AssetIcon category={asset.category} />
                  </div>
                </td>
                <td className="p-3 align-middle text-gray-800">{asset.category}</td>
                <td className="p-3 align-middle font-medium text-gray-800">{asset.asset_name}</td>
                <td className="p-3 align-middle text-gray-800">{asset.subcategory}</td>
                <td className="p-3 align-middle text-gray-800">{asset.department}</td>
                <td className="p-3 align-middle text-gray-800">{asset.user_name}</td>
                <td className="p-3 align-middle text-gray-800">{asset.user_id}</td>
                <td className="p-3 space-x-2 text-center align-middle whitespace-nowrap">
                  <Link to={`/asset/${asset.id}`} className="bg-blue-600 hover:bg-blue-700 table-action-button">
                    Detail
                  </Link>

                  <Link to={`/asset/history/${asset.asset_name}`} className="bg-blue-500 hover:bg-blue-600 table-action-button">
                    History
                  </Link>

                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(asset.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white table-action-button"
                  >
                    Delete
                  </Link>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-6 text-gray-500">
                No assets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AssetList;