// src/pages/EditAssetPage.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import AssetForm from '../components/AssetForm';

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

        const masterDataTypes = [
          'category', 'subcategory', 'brand', 'ram', 'storage', 
          'department', 'location', 'status',
          'windows', 'office', 'antivirus',
          'special_program'
        ];

        const masterDataRequests = masterDataTypes.map(type => api.get(`/master-data/${type}`));
        const assetRequest = api.get(`/assets/${assetId}`);
        const employeesRequest = api.get(`/employees`);

        const [assetResponse, employeesResponse, ...masterDataResponses] = await Promise.all([
          assetRequest, 
          employeesRequest, 
          ...masterDataRequests
        ]);

        const fetchedMasterData = masterDataTypes.reduce((acc, type, index) => {
          acc[type] = masterDataResponses[index].data.map(item => item.value);
          return acc;
        }, {});
        
        fetchedMasterData.user_name = employeesResponse.data.map(emp => emp.fullName);
        setMasterData(fetchedMasterData);

        const asset = assetResponse.data;

        setFormData({
          ...asset,
          start_date: asset.start_date ? new Date(asset.start_date).toISOString().split('T')[0] : '',
          bitlockerKeys: asset.bitlockerKeys || [],
          specialPrograms: asset.specialPrograms || []
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching data for edit page:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId]);

  // รับ 'data' มาจาก React Hook Form โดยตรง
const handleSubmit = async (data) => {
  if (!data) return;
  const payload = { ...data };
  if (!payload.start_date || String(payload.start_date).trim() === '') {
    payload.start_date = null;
  }

  try {
    await api.put(`/assets/${assetId}`, payload);
    alert("Asset updated successfully!");
    navigate(`/asset/${assetId}`);
  } catch (error) {
    console.error("Error updating asset:", error);
    alert(error?.response?.data?.message || "Unable to update asset.");
  }
};

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!formData || !masterData) return <div className="p-4">No data found for editing.</div>;

  return (
    <AssetForm
      isEditing={true}
      formData={formData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/asset/${assetId}`)}
      masterData={masterData}
    />
  );
}

export default EditAssetPage;