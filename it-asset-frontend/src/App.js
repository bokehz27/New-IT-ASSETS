// src/App.js

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import SettingsLayout from "./components/layout/SettingsLayout";

// Pages
import AssetListPage from "./pages/AssetListPage";
import AddAssetPage from "./pages/AddAssetPage";
import EditAssetPage from "./pages/EditAssetPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TicketFormPage from "./pages/TicketFormPage";
import TicketListPage from "./pages/TicketListPage";
import UpdateTicketPage from "./pages/UpdateTicketPage";
import ManagementPage from "./pages/ManagementPage";
import AssetTicketHistoryPage from "./pages/AssetTicketHistoryPage";
import ImportAssetsPage from "./pages/ImportAssetsPage";
import AddDataHubPage from "./pages/AddDataHubPage";
import AdminTicketFormPage from "./pages/AdminTicketFormPage";
import UserManagementPage from "./pages/UserManagementPage";
import DashboardPage from "./pages/DashboardPage";
import SwitchListPage from "./pages/SwitchListPage";
import SwitchDetailPage from "./pages/SwitchDetailPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppHeader from './components/layout/AppHeader';

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/report-issue" element={<TicketFormPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/assets" element={<AssetListPage />} />
              <Route path="/add" element={<AddAssetPage />} />
              <Route path="/import" element={<ImportAssetsPage />} />
              <Route path="/add-data" element={<AddDataHubPage />} />
              <Route path="/edit/:assetId" element={<EditAssetPage />} />
              <Route path="/asset/:assetId" element={<AssetDetailPage />} />
              <Route path="/asset/history/:assetCode" element={<AssetTicketHistoryPage />} />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/update-ticket/:ticketId" element={<UpdateTicketPage />} />
              <Route path="/admin/create-ticket" element={<AdminTicketFormPage />} />
              <Route path="/switches" element={<SwitchListPage />} />
              <Route path="/switches/:switchId" element={<SwitchDetailPage />} />
              
              <Route path="/settings" element={<SettingsLayout />}>
                <Route path="category" element={<ManagementPage title="จัดการหมวดหมู่อุปกรณ์" dataType="category" />} />
                <Route path="subcategory" element={<ManagementPage title="จัดการหมวดหมู่ย่อย" dataType="subcategory" />} />
                <Route path="brand" element={<ManagementPage title="จัดการยี่ห้อ" dataType="brand" />} />
                <Route path="ram" element={<ManagementPage title="จัดการ RAM" dataType="ram" />} />
                <Route path="storage" element={<ManagementPage title="จัดการ Harddisk" dataType="storage" />} />
                <Route path="department" element={<ManagementPage title="จัดการแผนก" dataType="department" />} />
                <Route path="location" element={<ManagementPage title="จัดการพื้นที่ใช้งาน" dataType="location" />} />
                <Route path="user_name" element={<UserManagementPage />} />
                <Route path="repair-type" element={<ManagementPage title="จัดการประเภทการซ่อม" dataType="repair_type" />} />
                
                {/* --- (เพิ่มใหม่) Route สำหรับจัดการข้อมูล Software --- */}
                <Route path="windows" element={<ManagementPage title="จัดการรุ่น Windows" dataType="windows" />} />
                <Route path="office" element={<ManagementPage title="จัดการรุ่น Office" dataType="office" />} />
                <Route path="antivirus" element={<ManagementPage title="จัดการโปรแกรม Antivirus" dataType="antivirus" />} />
                <Route path="special_program" element={<ManagementPage title="จัดการโปรแกรมพิเศษ" dataType="special_program" />} />
                {/* ---------------------------------------------- */}
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;