import React from 'react';
import RelationalMasterDataManagement from '../components/RelationalMasterDataManagement';

const ManageEmployeesPage = () => {
  // 1. กำหนดคอลัมน์ที่จะแสดงในตาราง
  const columns = [
    { key: 'name', name: 'Employee Name' },
    { key: 'email_id', name: 'Email' },       // จะแสดงเป็นอีเมล ไม่ใช่ ID
    { key: 'position_id', name: 'Position' },   // จะแสดงเป็นตำแหน่ง ไม่ใช่ ID
    { key: 'department_id', name: 'Department' } // จะแสดงเป็นแผนก ไม่ใช่ ID
  ];

  // 2. กำหนดความสัมพันธ์ทั้งหมดสำหรับ Dropdowns
  const relations = [
    {
      apiEndpoint: 'emails',          // API สำหรับดึงข้อมูลอีเมล
      foreignKey: 'email_id',       // Key ที่ใช้เก็บ ID
      displayField: 'email',          // Field ที่จะแสดงใน Dropdown
      label: 'Email'                  // ชื่อ Label ของ Dropdown
    },
    {
      apiEndpoint: 'positions',       // API สำหรับดึงข้อมูลตำแหน่ง
      foreignKey: 'position_id',    // Key ที่ใช้เก็บ ID
      displayField: 'name',           // Field ที่จะแสดงใน Dropdown
      label: 'Position'               // ชื่อ Label ของ Dropdown
    },
    {
      apiEndpoint: 'departments',     // API สำหรับดึงข้อมูลแผนก
      foreignKey: 'department_id',  // Key ที่ใช้เก็บ ID
      displayField: 'name',           // Field ที่จะแสดงใน Dropdown
      label: 'Department'             // ชื่อ Label ของ Dropdown
    }
  ];

  return (
    <RelationalMasterDataManagement
      apiEndpoint="employees"
      title="Employee"
      dataColumns={columns}
      relations={relations}
    />
  );
};

export default ManageEmployeesPage;