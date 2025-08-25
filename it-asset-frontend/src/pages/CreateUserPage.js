import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- (เพิ่มใหม่) ไอคอนสำหรับ UI ---
const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('it_staff'); // --- (แก้ไข) ค่าเริ่มต้นคือ 'it_staff' ---
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- (เพิ่มใหม่) ตรวจสอบความยาวรหัสผ่าน ---
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    try {
      await register(username, password, role); // --- (แก้ไข) ส่ง role ไปด้วย ---
      setSuccess(`User "${username}" has been created successfully!`);
      // --- (เพิ่มใหม่) Reset ฟอร์มหลังสร้างสำเร็จ ---
      setUsername('');
      setPassword('');
      setRole('it_staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Username might already be taken.');
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center">
            <UserPlusIcon />
            <h2 className="text-3xl font-bold text-center text-gray-800">Create New User</h2>
        </div>
        <p className="text-center text-gray-500">Create an account for a new IT staff member.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 text-sm text-center p-3 bg-red-100 rounded-md">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center p-3 bg-green-100 rounded-md">{success}</p>}
          
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full" // ใช้ Global Style
              required
              placeholder="e.g., somchai.k"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full" // ใช้ Global Style
              required
              placeholder="At least 6 characters"
            />
          </div>

          {/* --- (เพิ่มใหม่) Dropdown สำหรับเลือก Role --- */}
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">Role</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full" // ใช้ Global Style
            >
                <option value="it_staff">IT Staff</option>
                <option value="admin">Administrator</option>
            </select>
          </div>
          {/* ------------------------------------------- */}

          <div>
            <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-transform transform hover:scale-105">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;