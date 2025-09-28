import React from 'react';
import RelationalMasterDataManagement from '../components/RelationalMasterDataManagement';

const ManageSubCategoriesPage = () => {
  // 1. กำหนดคอลัมน์ที่จะแสดงในตาราง
  const columns = [
    { key: 'name', name: 'Subcategory Name' },
    { key: 'category_id', name: 'Category' } // คอลัมน์นี้จะมาจาก Dropdown
  ];

  // 2. กำหนดความสัมพันธ์สำหรับ Dropdown
  const relations = [
    {
      apiEndpoint: 'categories',      // API ที่จะไปดึงข้อมูลมาใส่ Dropdown
      foreignKey: 'category_id',    // Key ที่จะใช้เก็บ ID
      displayField: 'name',           // Field ที่จะแสดงใน Dropdown
      label: 'Category'               // ชื่อ Label ของ Dropdown
    }
  ];

  return (
    <RelationalMasterDataManagement
      apiEndpoint="subcategories"
      title="Subcategory"
      dataColumns={columns}
      relations={relations}
    />
  );
};

export default ManageSubCategoriesPage;