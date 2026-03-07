import axios from "axios";
import Swal from "sweetalert2";

/* =========================================
   ✅ API Instance (Fixed for LAN / IP Access)
========================================= */

/*
  🔥 สำคัญมาก:
  - ถ้าเข้าเว็บจาก localhost → backend จะเป็น localhost:5000
  - ถ้าเข้าเว็บจาก IP เช่น 172.18.1.61 → backend จะเป็น 172.18.1.61:5000
*/
const api = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
});

/* =========================================
   ✅ Request Interceptor (Attach Token)
========================================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["x-auth-token"] = token;
  }

  return config;
});

/* =========================================
   ✅ Global Response Error Handler
========================================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.log("API ERROR >>>", error?.response);

    /* Network Error (Backend Down / Wrong IP) */
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

    /* Token Expired / Unauthorized */
    const isTokenError =
      status === 401 ||
      status === 403 ||
      (status === 400 && msg.toLowerCase().includes("token"));

    if (isTokenError) {
      await Swal.fire({
        icon: "warning",
        title: "เซสชันหมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "เข้าสู่ระบบใหม่",
      });

      /* Clear Token */
      localStorage.removeItem("token");

      /* Redirect */
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
