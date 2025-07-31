import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/'); // เมื่อ login สำเร็จ ให้ไปที่หน้าแรก
    } catch (err) {
      setError('Failed to log in. Please check your username and password.');
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      {/* Card: ใช้ bg-white และ shadow-md ซึ่งถูก override ใน CSS แล้ว */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md animate-fade-in-slide-down">
        {/* Title: ปรับสีเป็น text-primary */}
        <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message: ปรับสีเป็น --color-error */}
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
            {/* Button: ใช้คลาส bg-indigo-600 ที่ถูก map เป็น Primary Button สำหรับหน้า Login */}
            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold">
              Log In
            </button>
          </div>
        </form>
        {/*<p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          {/* Link: คลาส text-blue-600 ถูก map เป็นสี Primary แล้ว 
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Register here
          </Link>
        </p>*/}
      </div>
    </div>
  );
}

export default LoginPage;