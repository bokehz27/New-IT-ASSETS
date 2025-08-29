import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// --- กำหนด API URL จาก .env ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // เริ่มต้นด้วยสถานะ loading

  // --- ฟังก์ชัน Logout ที่จะถูกเรียกใช้จากหลายที่ ---
const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setUser(null);
    window.location.href = '/login'; // <-- เพิ่มบรรทัดนี้
  };

  useEffect(() => {
    // --- 1. สร้าง Axios Interceptor เพื่อดักจับ Error 401 ทั่วทั้งแอป ---
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // ถ้า API ตอบกลับมาว่า Token ไม่ถูกต้อง (Error 401)
        if (error.response && error.response.status === 401) {
          logout(); // ให้ทำการ Logout ทันที
        }
        return Promise.reject(error);
      }
    );

    // --- 2. ตรวจสอบ Token ที่ค้างอยู่ตอนเปิดแอปครั้งแรก ---
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['x-auth-token'] = storedToken;
        try {
          // ยิง API ไปให้ Backend ตรวจสอบว่า Token นี้ยังใช้ได้หรือไม่
          const res = await axios.get(`${API_URL}/auth/verify`);
          setUser(res.data.user); // ถ้าใช้ได้ ให้ตั้งค่า user
          setToken(storedToken);
        } catch (err) {
          // ถ้า Backend บอกว่า Token ใช้ไม่ได้ ให้ Logout
          logout();
        }
      }
      setLoading(false); // ตรวจสอบเสร็จแล้ว ให้หยุด loading
    };

    verifyToken();

    // Cleanup interceptor ตอน component ถูก unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // useEffect นี้จะทำงานแค่ครั้งเดียวตอนแอปเริ่ม

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['x-auth-token'] = token;
      setToken(token);
      setUser(user);
      return res;
    } catch (err) {
      console.error('Login failed:', err.response?.data);
      throw err;
    }
  };

  const register = async (username, password) => {
    // ... ฟังก์ชัน register เหมือนเดิม ...
  };

  // ไม่ต้องส่ง loading แล้ว เพราะเราจะรอจนกว่าจะเช็ค Token เสร็จ
  return (
    <AuthContext.Provider value={{ token, user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};