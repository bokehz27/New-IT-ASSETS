// frontend/src/pages/AdminManagementPage.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminUserModal from '../components/AdminUserModal'; // ปรับ path ตามโปรเจกต์ของคุณ

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// แนบ token ทุกครั้ง
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

export default function AdminManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const res = await api.get('/users'); // ต้องส่ง id, username, role มาด้วย (แก้ backend ด้านล่าง)
      setUsers(res.data || []);
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to fetch users.';
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // รับมาจาก AdminUserModal -> บันทึก user (add/edit)
  const handleSave = async (formData, id = null) => {
    try {
      if (id) {
        await api.put(`/users/${id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      closeModal();
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        'Save failed.';
      alert(msg); // ใช้ alert เฉพาะแจ้ง error สั้นๆ
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`ลบผู้ใช้ ${user.username}?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        'Delete failed.';
      alert(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Admin &amp; User Management</h2>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={openAdd}
        >
          + Add User
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && errMsg && (
        <p className="text-red-600 mb-4">{errMsg} You might not have permission.</p>
      )}

      {!loading && !errMsg && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border">Username</th>
                <th className="p-3 text-left border">Role</th>
                <th className="p-3 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="p-3 border" colSpan="3">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 border">{u.username}</td>
                    <td className="p-3 border">{u.role}</td>
                    <td className="p-3 border">
                      <button
                        className="px-3 py-1 mr-2 rounded border hover:bg-gray-50"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded border hover:bg-gray-50"
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AdminUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}
