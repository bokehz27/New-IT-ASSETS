import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
    department: '', category: '', status: 'Enable',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. กำหนด master data types ที่ต้องการ โดยเอา 'user_name' ออก
        const masterDataTypes = ['category', 'subcategory', 'brand', 'ram', 'storage', 'department', 'location'];
        const masterDataRequests = masterDataTypes.map(type => axios.get(`${API_URL}/master-data/${type}`));

        // 2. เพิ่มการดึงข้อมูลจากตาราง employees
        const employeesRequest = axios.get(`${API_URL}/employees`);
        
        // 3. ดึงข้อมูลทั้งหมดพร้อมกัน
        const [employeesResponse, ...masterDataResponses] = await Promise.all([employeesRequest, ...masterDataRequests]);

        // 4. จัดการข้อมูล master data
        const fetchedMasterData = masterDataTypes.reduce((acc, type, index) => {
          acc[type] = masterDataResponses[index].data.map(item => item.value);
          return acc;
        }, {});

        // 5. นำข้อมูลพนักงานที่ดึงมาใหม่ ใส่กลับเข้าไปใน key 'user_name'
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
      await axios.post(`${API_URL}/assets`, formData);
      navigate('/');
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Failed to create asset.");
    }
  };

  if (loading) {
    return <div>Loading form options...</div>;
  }

  return (
    <div>
      <AssetForm
        isEditing={false}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        masterData={masterData}
      />
    </div>
  );
}

export default AddAssetPage;