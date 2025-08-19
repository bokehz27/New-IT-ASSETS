// src/pages/EditAssetPage.js

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const masterDataTypes = [
            'category', 'subcategory', 'brand', 'ram', 'storage', 
            'department', 'location', 'status',
            'windows', 'office', 'antivirus',
            'special_program' // --- (เพิ่ม) dataType ใหม่ ---
        ];

        const masterDataRequests = masterDataTypes.map(type => axios.get(`${API_URL}/master-data/${type}`, { headers }));
        const assetRequest = axios.get(`${API_URL}/assets/${assetId}`, { headers });
        const employeesRequest = axios.get(`${API_URL}/employees`, { headers });
        
        const [assetResponse, employeesResponse, ...masterDataResponses] = await Promise.all([assetRequest, employeesRequest, ...masterDataRequests]);

        const fetchedMasterData = masterDataTypes.reduce((acc, type, index) => {
          acc[type] = masterDataResponses[index].data.map(item => item.value);
          return acc;
        }, {});
        
        fetchedMasterData.user_name = employeesResponse.data.map(emp => emp.fullName);
        setMasterData(fetchedMasterData);

        const asset = assetResponse.data;
        
        // --- (แก้ไข) จัดรูปแบบข้อมูล specialPrograms และ bitlockerKeys ---
        setFormData({
          ...asset,
          start_date: asset.start_date ? new Date(asset.start_date).toISOString().split('T')[0] : '',
          bitlockerKeys: asset.bitlockerKeys || [],
          specialPrograms: asset.specialPrograms || [] // <-- เพิ่มบรรทัดนี้
        });
        // -----------------------------------------------------------
        setError(null);
      } catch (err) {
        console.error("Error fetching data for edit page:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/assets/${assetId}`, formData, {
        headers: { 'x-auth-token': token }
      });
      alert("อัปเดตข้อมูลสำเร็จ!");
      navigate(`/asset/${assetId}`); 
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!formData || !masterData) return <div>ไม่พบข้อมูลสำหรับแก้ไข</div>;

  return (
    <AssetForm
      isEditing={true}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/asset/${assetId}`)}
      masterData={masterData}
    />
  );
}

export default EditAssetPage;