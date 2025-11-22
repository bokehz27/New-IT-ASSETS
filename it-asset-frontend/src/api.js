import axios from "axios";
import Swal from "sweetalert2";

// สร้าง instance ของ axios พร้อมกำหนดค่าเริ่มต้น
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// แนบ Token ไปทุก request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

// ดักจับ response error แบบ Global
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ลอง log ดูก่อนว่า backend ส่งอะไรมา
    console.log("API ERROR >>>", error?.response);

    // ถ้าเป็น network error / server ไม่ตอบเลย
    if (!error.response) {
      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        text: "กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ",
      });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data = error.response.data;
    const msg =
      (typeof data === "string" && data) ||
      data?.msg ||
      data?.message ||
      "";

    // เงื่อนไขจับ session หมดอายุ / token มีปัญหา
    const isTokenError =
      status === 401 ||
      status === 403 ||
      (status === 400 &&
        msg.toLowerCase().includes("token")); // กันเคส backend ส่ง 400 + ข้อความเกี่ยวกับ token

    if (isTokenError) {
      await Swal.fire({
        icon: "warning",
        title: "เซสชันหมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "เข้าสู่ระบบใหม่",
      });

      // Clear Token
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
