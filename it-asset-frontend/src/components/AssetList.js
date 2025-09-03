import React from "react";
import { Link } from "react-router-dom";
// --- 1. นำเข้าไอคอนที่ต้องการจาก react-icons/fa ---
// fa คือชุดไอคอนของ Font Awesome, คุณสามารถเลือกชุดอื่นได้เช่นกัน (เช่น md, io)

import { FaLaptop, FaServer, FaHdd, FaBoxOpen } from "react-icons/fa"; // Notebook, Server, Network Equipments, defult
import { AiFillPrinter } from "react-icons/ai";
import { FaComputer } from "react-icons/fa6"; // Desktop
import { FaCarBattery } from "react-icons/fa6"; // UPS
import { GrLicense } from "react-icons/gr"; // License
import { MdOutlineScreenshotMonitor } from "react-icons/md"; // Monitor
import { PiVideoConferenceFill } from "react-icons/pi"; // Conference
import { BiSolidMemoryCard } from "react-icons/bi"; // Memery

// --- 2. สร้าง Component สำหรับเลือกไอคอน (Icon Component) ---
// Component นี้จะรับ props ชื่อ category และ return ไอคอนที่เหมาะสม
// ทำให้โค้ดในตารางสะอาดและอ่านง่ายขึ้น
const AssetIcon = ({ category }) => {
  // ตั้งค่าขนาดและสไตล์พื้นฐานสำหรับไอคอนทั้งหมด
  const iconProps = {
    size: 35, // ขนาดไอคอน
    className: "text-gray-600", // สีไอคอน
  };

  switch (category) {
    case "Notebook - Office (Document)":
    case "Notebook - Factory (Machine)":
      return <FaLaptop {...iconProps} />;
    case "Desktop - Office (Document)":
    case "Desktop - Factory (Machine)":
      return <FaComputer {...iconProps} />;
    case "Printer":
      return <AiFillPrinter {...iconProps} />;
    case "Server":
      return <FaServer {...iconProps} />;
    case "Network Equipments":
      return <FaHdd {...iconProps} />;
    case "UPS":
      return <FaCarBattery {...iconProps} />;
    case "License":
      return <GrLicense {...iconProps} />;
    case "Monitor":
      return <MdOutlineScreenshotMonitor {...iconProps} />;
    case "Conference Equipments":
      return <PiVideoConferenceFill {...iconProps} />;
    case "Memory Card and Camera":
      return <BiSolidMemoryCard {...iconProps} />;
    // case "ชื่อ Category อื่นๆ":
    //   return <YourChosenIcon {...iconProps} />;
    default:
      // หากไม่ตรงกับ case ไหนเลย จะแสดงไอคอนกล่อง (default)
      return <FaBoxOpen {...iconProps} />;
  }
};

function AssetList({ assets, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full text-left text-sm">
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
        <tbody className="divide-y divide-gray-200">
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="p-2 align-middle">
                  {/* --- 3. เรียกใช้ AssetIcon Component ในตาราง --- */}
                  <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-md">
                    <AssetIcon category={asset.category} />
                  </div>
                </td>
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
