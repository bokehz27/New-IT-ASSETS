import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";

// Layouts
import SettingsLayout from "./components/layout/SettingsLayout";

// Pages
import AssetListPage from "./pages/AssetListPage";
import AddAssetPage from "./pages/AddAssetPage";
import EditAssetPage from "./pages/EditAssetPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import ManagementPage from "./pages/ManagementPage";
import AssetTicketHistoryPage from "./pages/AssetTicketHistoryPage";
import ImportAssetsPage from "./pages/ImportAssetsPage";
import AddDataHubPage from "./pages/AddDataHubPage";
import UserManagementPage from "./pages/UserManagementPage";
import DashboardPage from "./pages/DashboardPage";
import SwitchListPage from "./pages/SwitchListPage";
import SwitchDetailPage from "./pages/SwitchDetailPage";
import ReportPage from "./pages/ReportPage";
import PublicFaqPage from "./pages/PublicFaqPage";
import FaqManagementPage from "./pages/FaqManagementPage";
import SettingsIndexPage from "./pages/SettingsIndexPage";
import BackupManagerPage from "./pages/BackupManagerPage";


// Protected Route
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AppHeader from "./components/layout/AppHeader";

import ManageTicketsPage from "./pages/ManageTicketsPage";
import PublicTicketPage from "./pages/PublicTicketPage";
import VendorManagementPage from "./pages/VendorManagementPage";
import { Navigate } from "react-router-dom";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/faq" element={<PublicFaqPage />} />
            {!user && (
              <Route path="/" element={<Navigate to="/faq" replace />} />
            )}

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<AdminManagementPage />} />
            <Route path="/report-issue" element={<PublicTicketPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/assets" element={<AssetListPage />} />
              <Route path="/add" element={<AddAssetPage />} />
              <Route path="/import" element={<ImportAssetsPage />} />
              <Route path="/add-data" element={<AddDataHubPage />} />
              <Route path="/edit/:assetId" element={<EditAssetPage />} />
              <Route path="/asset/:assetId" element={<AssetDetailPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route
                path="/asset/history/:assetCode"
                element={<AssetTicketHistoryPage />}
              />
              <Route path="/create-user" element={<AdminManagementPage />} />

              <Route path="/switches" element={<SwitchListPage />} />
              <Route
                path="/switches/:switchId"
                element={<SwitchDetailPage />}
              />
              <Route path="/manage-faq" element={<FaqManagementPage />} />
              <Route path="/manage-tickets" element={<ManageTicketsPage />} />
              <Route path="/vendors" element={<VendorManagementPage />} />
              <Route path="/backups" element={<BackupManagerPage />} />
            </Route>
            
            {/* ✨ 2. อัปเดตเฉพาะ Route ภายใต้ /settings ✨ */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SettingsIndexPage />} />
                ...
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
