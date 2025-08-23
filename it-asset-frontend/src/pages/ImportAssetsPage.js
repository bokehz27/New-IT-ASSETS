// src/pages/ImportAssetsPage.js

import React, { useState } from 'react';
// --- CHANGE 1: Import the central 'api' instance instead of 'axios' ---
import api from '../api'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

// --- CHANGE 2: Remove the unnecessary API_URL constant ---
// const API_URL = 'http://172.18.1.61:5000/api/assets/upload';

function ImportAssetsPage() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setMessage('');
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (results) => {
          setHeaders(results.meta.fields);
          setPreviewData(results.data);
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // --- CHANGE 3: Use the 'api' instance for the POST request ---
      // Headers are now handled automatically.
      const res = await api.post('/assets/upload', formData);
      
      setMessage(res.data.message);
      setPreviewData([]);
      setFile(null);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during upload.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  
  const csvTemplateHeaders = "asset_code,serial_number,brand,model,subcategory,ram,cpu,storage,device_id,ip_address,wifi_registered,mac_address_lan,mac_address_wifi,start_date,location,fin_asset_ref,user_id,user_name,department,category,status,windows_version,windows_key,office_version,office_key,antivirus";

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplateHeaders], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "asset_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- No changes to JSX below ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Import Assets from CSV</h2>
      
      <div className="bg-blue-50 border border-gray-200 text-blue-800 p-4 rounded-md mb-6 text-sm">
        <p className="font-semibold">คำแนะนำ:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>ไฟล์ต้องเป็นนามสกุล .csv และเข้ารหัสแบบ UTF-8</li>
          <li>คอลัมน์แรก (Header) ต้องตรงกับ Template ทุกตัวอักษร</li>
          <li>วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD</li>
          <li>
            <button onClick={handleDownloadTemplate} className="text-blue-600 font-semibold hover:underline">
              ดาวน์โหลดไฟล์ Template ที่นี่
            </button>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-semibold text-gray-600">เลือกไฟล์ CSV</label>
        <div className="flex items-center gap-4">
          <label htmlFor="csv-upload" className="file-input-label">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>เลือกไฟล์</span>
          </label>
          <span className="text-sm text-gray-500">
            {file ? file.name : "ยังไม่ได้เลือกไฟล์"}
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
          <h3 className="text-lg font-semibold mb-2 text-gray-800">ตัวอย่างข้อมูล (5 แถวแรก)</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {headers.map(header => <th key={header} className="px-4 py-2 font-semibold">{header}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className="bg-white hover:bg-gray-50">
                    {headers.map(header => <td key={header} className="px-4 py-2 truncate max-w-xs">{row[header]}</td>)}
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
          {uploading ? 'กำลังนำเข้า...' : 'ยืนยันและนำเข้าข้อมูล'}
        </button>
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition"
        >
          ยกเลิก
        </button>
      </div>

      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
    </div>
  );
}

export default ImportAssetsPage;