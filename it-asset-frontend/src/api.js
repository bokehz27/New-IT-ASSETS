// src/api.js
import axios from "axios";

// สร้าง instance ของ axios พร้อมกำหนดค่าเริ่มต้น
const api = axios.create({
  baseURL: "http://172.18.1.61:5000/api", // <-- กำหนด URL หลักของ Backend ที่นี่
});

// ตั้งค่าให้ส่ง token ไปกับทุก request โดยอัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

export default api;
