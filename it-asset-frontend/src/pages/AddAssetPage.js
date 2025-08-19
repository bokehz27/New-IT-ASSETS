// src/pages/AddAssetPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AssetForm from '../components/AssetForm'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function AddAssetPage() {
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    asset_code: '', serial_number: '', brand: '', model: '', subcategory: '',
    ram: '', cpu: '', storage: '', device_id: '', ip_address: '',
    wifi_registered: 'Wifi not register', mac_address_lan: '', mac_address_wifi: '',
    start_date: '', location: '', fin_asset_ref: '', user_id: '', user_name: '',
    department: '', category: '', status: 'Available',
    bitlockerKeys: [],
    windows_version: '',
    windows_key: '',
    office_version: '',
    office_key: '',
    antivirus: '',
    specialPrograms: [] // --- (แก้ไข) เปลี่ยนจาก '' เป็น [] ---
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const masterDataTypes = [
            'category', 'subcategory', 'brand', 'ram', 'storage', 
            'department', 'location', 'status', 
            'windows', 'office', 'antivirus',
            'special_program' // --- (เพิ่ม) dataType ใหม่ ---
        ];
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const masterDataRequests = masterDataTypes.map(type => axios.get(`${API_URL}/master-data/${type}`, { headers }));
        const employeesRequest = axios.get(`${API_URL}/employees`, { headers });
        
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/assets`, formData, {
        headers: { 'x-auth-token': token }
      });
      alert("เพิ่มอุปกรณ์ใหม่สำเร็จ!");
      navigate('/'); 
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("ไม่สามารถเพิ่มอุปกรณ์ได้");
    }
  };

  if (loading || !masterData) {
    return <div>กำลังโหลดตัวเลือกสำหรับฟอร์ม...</div>;
  }

  return (
    <AssetForm
      isEditing={false}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/')}
      masterData={masterData}
    />
  );
}

export default AddAssetPage;