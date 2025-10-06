import axios from "axios";

// สร้าง instance ของ axios พร้อมกำหนดค่าเริ่มต้น
const api = axios.create({
  // ดึง URL หลักของ Backend จาก environment variable
  baseURL: process.env.REACT_APP_API_URL, 
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