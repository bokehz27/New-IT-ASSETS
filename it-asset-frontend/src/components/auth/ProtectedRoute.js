import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const { token } = useAuth();

  // ถ้ามี token (ล็อกอินอยู่) ให้แสดงหน้าที่ต้องการ (Outlet)
  // ถ้าไม่มี ให้ redirect ไปหน้า login
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
