// src/pages/AddAssetPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetForm from '../components/AssetForm';
import api from '../api';

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
        
        // 2. ไม่ต้องดึง token หรือสร้าง headers เองแล้ว
        // const token = localStorage.getItem('token');
        // const headers = { 'x-auth-token': token };

        // 3. เปลี่ยนไปใช้ `api` และใช้ URL แบบย่อ
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // 3. Use `api.post` without custom headers
    await api.post('/assets', formData);

    alert("New asset added successfully!");
    navigate('/');
  } catch (error) {
    console.error("Error creating asset:", error);
    alert("Unable to add the asset.");
  }
};

if (loading || !masterData) {
  return <div>Loading form options...</div>;
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