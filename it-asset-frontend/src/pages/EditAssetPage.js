import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AssetForm from '../components/AssetForm';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function EditAssetPage() {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [formData, setFormData] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. กำหนด master data types ที่ต้องการ โดยเอา 'user_name' ออก
        const masterDataTypes = ['category', 'subcategory', 'brand', 'ram', 'storage', 'department', 'location'];
        const masterDataRequests = masterDataTypes.map(type => axios.get(`${API_URL}/master-data/${type}`));

        // 2. เพิ่มการดึงข้อมูล asset และ employees
        const assetRequest = axios.get(`${API_URL}/assets/${assetId}`);
        const employeesRequest = axios.get(`${API_URL}/employees`);
        
        // 3. ดึงข้อมูลทั้งหมดพร้อมกัน
        const [assetResponse, employeesResponse, ...masterDataResponses] = await Promise.all([assetRequest, employeesRequest, ...masterDataRequests]);

        // 4. จัดการ Master Data (แก้ไข dataTypes เป็น masterDataTypes)
        const fetchedMasterData = masterDataTypes.reduce((acc, type, index) => {
          acc[type] = masterDataResponses[index].data.map(item => item.value);
          return acc;
        }, {});
        
        // 5. นำข้อมูลพนักงานที่ดึงมาใหม่ ใส่กลับเข้าไปใน key 'user_name'
        fetchedMasterData.user_name = employeesResponse.data.map(emp => emp.fullName);
        setMasterData(fetchedMasterData);

        // 6. จัดการข้อมูล Asset ที่จะแก้ไข
        const asset = assetResponse.data;
        setFormData({
          ...asset,
          start_date: asset.start_date ? new Date(asset.start_date).toISOString().split('T')[0] : '',
        });

      } catch (error) {
        console.error("Error fetching data for edit page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/assets/${assetId}`, formData);
      navigate('/');
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Failed to update asset.");
    }
  };

  if (loading || !formData || !masterData) {
    return <div>Loading...</div>;
  }

  return (
    <AssetForm
      isEditing={true}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/')}
      masterData={masterData}
    />
  );
}

export default EditAssetPage;