// src/pages/AddAssetPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetForm from '../components/AssetForm';
import api from '../api';

function AddAssetPage() {
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);

  // formData ใช้สำหรับกำหนดค่าเริ่มต้นเท่านั้น
  const [formData] = useState({
    asset_code: '', serial_number: '', brand: '', model: '', subcategory: '',
    ram: '', cpu: '', storage: '', device_id: '', ip_address: '',
    wifi_registered: 'Wifi not register', mac_address_lan: '', mac_address_wifi: '',
    start_date: new Date().toISOString().split('T')[0], // ตั้งค่า default เป็นวันปัจจุบัน
    location: '', fin_asset_ref: '', user_id: '', user_name: '',
    department: '', category: '', status: 'Enable', // ตั้งค่า default status
    bitlockerKeys: [],
    windows_version: '',
    windows_key: '',
    office_version: '',
    office_key: '',
    antivirus: '',
    specialPrograms: []
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const masterDataTypes = [
            'category', 'subcategory', 'brand', 'ram', 'storage',
            'department', 'location', 'status',
            'windows', 'office', 'antivirus',
            'special_program'
        ];
        const masterDataRequests = masterDataTypes.map(type => api.get(`/master-data/${type}`));
        const employeesRequest = api.get('/employees');

        const [employeesResponse, ...masterDataResponses] = await Promise.all([employeesRequest, ...masterDataRequests]);

        const fetchedMasterData = masterDataTypes.reduce((acc, type, index) => {
          acc[type] = masterDataResponses[index].data.map(item => item.value);
          return acc;
        }, {});

        fetchedMasterData.user_name = employeesResponse.data.map(emp => emp.fullName);
        setMasterData(fetchedMasterData);

      } catch (error) {
        console.error("Failed to fetch initial data for the form", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // รับ 'data' มาจาก React Hook Form โดยตรง
  const handleSubmit = async ({ data, file }) => {
    try {
      // 1. สร้าง Asset ใหม่ก่อน
      const response = await api.post('/assets', data);
      const newAssetId = response.data.id; // ดึง ID จาก response

      // 2. ถ้ามีไฟล์แนบมา ให้ทำการอัปโหลด
      if (file && newAssetId) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        // อย่าลืมใส่ header ให้ถูกต้อง (ถ้า api.js ไม่ได้จัดการให้)
        await api.post(
          `/assets/${newAssetId}/upload-bitlocker`,
          formDataUpload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
      
      alert("New asset added successfully!");
      navigate('/');

    } catch (error) {
      console.error("Error creating asset:", error);
      // แยก error message เพื่อให้ผู้ใช้เข้าใจง่ายขึ้น
      const errorMessage = error.response?.data?.message || "Unable to add the asset.";
      alert(errorMessage);
    }
  };

  if (loading || !masterData) {
    return <div className="p-4">Loading form options...</div>;
  }

  return (
    <AssetForm
      isEditing={false}
      formData={formData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/')}
      masterData={masterData}
    />
  );
}

export default AddAssetPage;