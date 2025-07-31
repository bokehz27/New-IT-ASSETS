// src/pages/ManageRacksPage.js
import React from 'react';
import ManagementPage from '../components/ManagementPage'; // ตรวจสอบ Path ให้ถูกต้อง

function ManageRacksPage() {
  return (
    <div className="container mx-auto p-4">
      <ManagementPage 
        title="Manage Racks" 
        dataType="rack" 
      />
    </div>
  );
}

export default ManageRacksPage;