import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import officeAnimation from '../animations/Rocket research.json';

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
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your username and password.');
    }
  };

  return (
    //  แก้ไข: เปลี่ยนจาก min-h-screen เป็น h-screen และเพิ่ม overflow-hidden
    <div className="h-screen flex overflow-hidden">
      {/* ฝั่งซ้าย: สำหรับ Branding และ Visual (จะซ่อนในจอมือถือ) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 text-white flex-col items-center justify-center p-12 text-center">
        <Lottie
          animationData={officeAnimation}
          loop={true}
          className="w-full max-w-md mb-6"
        />
        <h1 className="text-4xl font-bold mb-3">IT COMMAND</h1>
        <p className="text-indigo-200">
          Please sign in to access the system.
        </p>
      </div>

      {/* ฝั่งขวา: สำหรับฟอร์ม Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign In
            </h2>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
              
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>

              <div>
                <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-lg transition-transform transform hover:scale-105">
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;