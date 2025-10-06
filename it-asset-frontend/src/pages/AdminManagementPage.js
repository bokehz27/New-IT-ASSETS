// pages/AdminManagementPage.js (แก้ไขแล้ว)

import React, { useState, useEffect } from "react";
import api from "../api";
import AdminUserModal from "../components/AdminUserModal";
import { toast } from "react-toastify";

// ✨ 1. Import PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

function AdminManagementPage() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  };

  const openModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = () => {
    fetchUsers();
    closeModal();
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success("User deleted successfully.");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user.");
      }
    }
  };

  // --- ✨ 2. สร้าง UI Templates สำหรับ DataTable ---
  const leftToolbarTemplate = () => (
    <Button
      label="Create User"
      icon="pi pi-plus"
      onClick={() => openModal()}
      className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 text-sm rounded-lg font-semibold shadow hover:opacity-90"
    />
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => openModal(rowData)} tooltip="Edit" />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => handleDelete(rowData.id)} tooltip="Delete" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
        User Management
      </h1>

      <Toolbar className="mb-4 p-2" left={leftToolbarTemplate}></Toolbar>

      {/* --- ✨ 3. เปลี่ยนจาก <table> เป็น <DataTable> --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable value={users} dataKey="id" size="small" stripedRows rowHover>
          <Column field="username" header="Username" sortable headerClassName="text-sm" bodyClassName="text-sm text-slate-800 p-3 font-medium" />
          <Column header="Actions" body={actionBodyTemplate} style={{ width: "120px", textAlign: 'center' }} headerClassName="text-sm" />
        </DataTable>
      </div>

      {isModalOpen && (
        <AdminUserModal user={selectedUser} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}

export default AdminManagementPage;