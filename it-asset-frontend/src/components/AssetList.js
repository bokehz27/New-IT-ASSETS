import React from "react";
import { Link } from "react-router-dom";

function AssetList({ assets, onDelete }) {
  return (
    // Card หลัก: ใช้ bg-white และ shadow-md ซึ่งถูก override ใน index.css แล้ว
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-left text-sm">
        {/* หัวตาราง: ใช้ bg-gray-50 และ border-gray-200 ที่ถูก override แล้ว */}
        <thead className="bg-blue-600">
          <tr>
            <th className="p-3 font-semibold text-white">Picture</th>
            <th className="p-3 font-semibold text-white">Categories</th>
            <th className="p-3 font-semibold text-white">IT Asset</th>
            <th className="p-3 font-semibold text-white">Subcategories</th>
            <th className="p-3 font-semibold text-white">Department</th>
            <th className="p-3 font-semibold text-white">Device Users</th>
            <th className="p-3 font-semibold text-white">User ID</th>
            <th className="p-3 font-semibold text-white text-center">
              Actions
            </th>
          </tr>
        </thead>
        {/* เนื้อหาตาราง: ใช้ divide-gray-200 ที่ถูก override แล้ว */}
        <tbody className="divide-y divide-gray-200">
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
              // Hover effect: ใช้ hover:bg-gray-50 ที่ถูก override แล้ว
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="p-2 align-middle">
                  {/* รูปภาพ Placeholder: ปรับสีพื้นหลังและไอคอน */}
                  <div className="w-16 h-16 bg-gray-50 flex items-center justify-center text-gray-500 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01"
                      />
                    </svg>
                  </div>
                </td>
                {/* ข้อความ: ปรับไปใช้ text-gray-800 ที่ map กับ --color-text-primary */}
                <td className="p-3 align-middle text-gray-800">
                  {asset.category}
                </td>
                <td className="p-3 align-middle font-medium text-gray-800">
                  {asset.asset_code}
                </td>
                <td className="p-3 align-middle text-gray-800">
                  {asset.subcategory}
                </td>
                <td className="p-3 align-middle text-gray-800">
                  {asset.department}
                </td>
                <td className="p-3 align-middle text-gray-800">
                  {asset.user_name}
                </td>
                <td className="p-3 align-middle text-gray-800">
                  {asset.user_id}
                </td>
                <td className="p-3 space-x-2 text-center align-middle whitespace-nowrap">
                  {/*
                    ปุ่ม Actions:
                    - เพิ่มคลาส table-action-button เพื่อใช้สไตล์ปุ่มในตารางที่กำหนดไว้
                    - เปลี่ยน bg-* เป็นคลาสที่ถูก map สีไว้ใน index.css (เช่น bg-purple-500 -> warning)
                    - ลบคลาสย่อยๆ (px, py, text-xs, rounded, shadow) เพราะถูกรวมอยู่ใน table-action-button แล้ว
                  */}

                  <Link
                    to={`/asset/${asset.id}`}
                    className="bg-blue-600 hover:bg-blue-700 table-action-button"
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/asset/history/${asset.asset_code}`}
                    className="bg-blue-500 hover:bg-blue-600 table-action-button"
                  >
                    History
                  </Link>
                  <Link
                    onClick={() => onDelete(asset.id)}
                    className="bg-red-500 hover:bg-red-600 table-action-button"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {/* ข้อความ "No assets found": ปรับสีให้เป็น --color-text-secondary */}
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
