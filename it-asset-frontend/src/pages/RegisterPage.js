import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, password);
      alert('Registration successful! Please log in.');
      navigate('/login'); // เมื่อ register สำเร็จ ให้ไปหน้า login
    } catch (err) {
      setError('Failed to register. Username might already be taken.');
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div>
            <label className="text-sm font-bold text-gray-600 block">Username</label>
            {/* Input: ลบคลาสสไตล์ออกทั้งหมด เหลือแค่ w-full เพราะใช้ Global Style */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Password</label>
            {/* Input: ลบคลาสสไตล์ออกทั้งหมด เหลือแค่ w-full เพราะใช้ Global Style */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div>
            {/* Button: ใช้คลาส bg-blue-500 ที่เป็น Primary Button มาตรฐาน */}
            <button type="submit" className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded-md font-semibold">
              Register
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;