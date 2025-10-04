import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { toast } from 'react-toastify'; // ✨ 1. Import toast เข้ามาใช้

function ImportAssetsPage() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [parsedData, setParsedData] = useState([]); // ✨ 2. State ใหม่สำหรับเก็บข้อมูลทั้งหมด
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // ✨ 3. แก้ไข Papa.parse ให้อ่านไฟล์ทั้งหมด
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
              toast.error("Error parsing CSV file. Please check the format.");
              console.error("CSV Parsing Errors:", results.errors);
              // เคลียร์ค่าทั้งหมดถ้าไฟล์ผิดพลาด
              setFile(null);
              setHeaders([]);
              setPreviewData([]);
              setParsedData([]);
              return;
          }
          setHeaders(results.meta.fields);
          setPreviewData(results.data.slice(0, 5)); // แสดงแค่ 5 แถวแรก
          setParsedData(results.data); // เก็บข้อมูลทั้งหมดไว้ใน state
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!file || parsedData.length === 0) {
      toast.error("Please select a valid CSV file to upload.");
      return;
    }
    setUploading(true);

    try {
      // ✨ 4. เปลี่ยนจากการส่ง FormData เป็นการส่ง JSON Array ไปที่ Endpoint ใหม่
      const res = await api.post("/assets/upload", parsedData);
      toast.success(res.data.message || "Assets imported successfully!");
      setPreviewData([]);
      setFile(null);
      setParsedData([]);
      setTimeout(() => navigate("/assets"), 2000); // กลับไปหน้า Asset List
    } catch (err) {
      const errorMsg = err.response?.data?.error || "An error occurred during import.";
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ✨ 5. อัปเดต Header ของ Template ให้ถูกต้อง
  const csvTemplateHeaders = "asset_name,serial_number,category,subcategory,brand,model,cpu,ram,storage,device_id,mac_address_lan,mac_address_wifi,wifi_status,windows_version,windows_product_key,office_version,office_product_key,antivirus,user_name,user_id,department,location,status,start_date,fin_asset_ref_no,remark";

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplateHeaders], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "asset_template_new.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Import Assets from CSV
      </h2>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 text-sm">
        <p className="font-semibold">Instructions:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>The file must be in .csv format and encoded in UTF-8.</li>
          <li>The first row (Header) must match the Template exactly. The order of columns is important.</li>
          <li>For fields like Category, Brand, Model, etc., please use the exact name as it appears in the system.</li>
          <li>
            <button
              onClick={handleDownloadTemplate}
              className="text-blue-600 font-semibold hover:underline"
            >
              Download New Template File Here
            </button>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-semibold text-gray-600">
          Select CSV File
        </label>
        <div className="flex items-center gap-4">
          <label htmlFor="csv-upload" className="file-input-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Select File</span>
          </label>
          <span className="text-sm text-gray-500">
            {file ? file.name : "No file selected"}
          </span>
        </div>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {previewData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Data Preview (First 5 Rows)
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className="bg-white hover:bg-gray-50">
                    {headers.map((header) => (
                      <td key={header} className="px-4 py-2 truncate max-w-xs">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
        >
          {uploading ? "Importing..." : "Confirm and Import Data"}
        </button>
        <button
          onClick={() => navigate("/assets")}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ImportAssetsPage;