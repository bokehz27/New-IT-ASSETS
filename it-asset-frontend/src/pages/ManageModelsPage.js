import React from 'react';
import RelationalMasterDataManagement from '../components/RelationalMasterDataManagement';

const ManageModelsPage = () => {
  const columns = [
    { key: 'name', name: 'Model Name' },
    { key: 'brand_id', name: 'Brand' } // คอลัมน์นี้จะมาจาก Dropdown
  ];

  const relations = [
    {
      apiEndpoint: 'brands',          // ไปดึงข้อมูลยี่ห้อ (brands)
      foreignKey: 'brand_id',       // เก็บ ID ของยี่ห้อ
      displayField: 'name',           // แสดงชื่อยี่ห้อ
      label: 'Brand'                  // ชื่อ Label
    }
  ];

  return (
    <RelationalMasterDataManagement
      apiEndpoint="models"
      title="Model"
      dataColumns={columns}
      relations={relations}
    />
  );
};

export default ManageModelsPage;