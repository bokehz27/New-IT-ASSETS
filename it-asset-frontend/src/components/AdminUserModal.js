import React, { useState, useEffect } from 'react';

function AdminUserModal({ isOpen, onClose, user, onSave }) {
  const initialFormState = {
    username: '',
    password: '',
    role: 'it_staff',
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError(''); // Clear error on open
      if (user) {
        // Edit mode
        setFormData({
          username: user.username || '',
          password: '', // ไม่ต้องแสดงรหัสผ่านเดิม
          role: user.role || 'it_staff',
        });
      } else {
        // Add mode
        setFormData(initialFormState);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.username) {
        setError("Username is required.");
        return;
    }
    if (!user && !formData.password) { // ต้องใส่รหัสผ่านเมื่อสร้าง user ใหม่
        setError("Password is required for new users.");
        return;
    }
    if (formData.password && formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    onSave(formData, user ? user.id : null); // ส่งข้อมูลกลับไปให้หน้าหลักจัดการ
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg z-50">
        <h2 className="text-2xl font-bold mb-4">
          {user ? 'Edit User' : 'Add New User'}
        </h2>
        {error && <p className="text-red-600 text-sm text-center p-2 mb-3 bg-red-100 rounded-md">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username*</label>
              <input
                type="text" name="username" value={formData.username}
                onChange={handleChange} className="w-full mt-1" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password" name="password" value={formData.password}
                onChange={handleChange} className="w-full mt-1"
                placeholder={user ? "Leave blank to keep current password" : "At least 6 characters"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full mt-1">
                <option value="it_staff">IT Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUserModal;
