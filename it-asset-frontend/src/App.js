import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import SettingsLayout from "./components/layout/SettingsLayout";

// Pages
import AssetListPage from "./pages/AssetListPage";
import AddAssetPage from "./pages/AddAssetPage";
import EditAssetPage from "./pages/EditAssetPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import TicketListPage from "./pages/TicketListPage";
import ManagementPage from "./pages/ManagementPage";
import AssetTicketHistoryPage from "./pages/AssetTicketHistoryPage";
import ImportAssetsPage from "./pages/ImportAssetsPage";
import AddDataHubPage from "./pages/AddDataHubPage";
import UserManagementPage from "./pages/UserManagementPage";
import DashboardPage from "./pages/DashboardPage";
import SwitchListPage from "./pages/SwitchListPage";
import SwitchDetailPage from "./pages/SwitchDetailPage";
import ReportPage from "./pages/ReportPage";
import PublicTicketListPage from "./pages/PublicTicketListPage";
import PublicFaqPage from "./pages/PublicFaqPage";
import FaqManagementPage from "./pages/FaqManagementPage";
import SettingsIndexPage from './pages/SettingsIndexPage';

// Protected Route
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AppHeader from "./components/layout/AppHeader";



// ✨ 1. Import หน้า Master Data ใหม่ทั้งหมดเข้ามา ✨
import ManageAssetStatusPage from './pages/ManageAssetStatusPage';
import ManageEmployeesPage from './pages/ManageEmployeesPage';
import ManageEmailsPage from './pages/ManageEmailsPage';
import ManageDepartmentsPage from './pages/ManageDepartmentsPage';
import ManageCpusPage from './pages/ManageCpusPage';
import ManageRamsPage from './pages/ManageRamsPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';
import ManageSubCategoriesPage from './pages/ManageSubCategoriesPage';
import ManageBrandsPage from './pages/ManageBrandsPage';
import ManageAssetSpecialProgramsPage from './pages/ManageAssetSpecialProgramsPage';
import ManageAntivirusPage from './pages/ManageAntivirusPage';
import ManagePositionsPage from './pages/ManagePositionsPage';
import ManageOfficeVersionsPage from './pages/ManageOfficeVersionsPage';
import ManageModelsPage from './pages/ManageModelsPage';
import ManageLocationsPage from './pages/ManageLocationsPage';
import ManageStoragesPage from './pages/ManageStoragesPage';
import ManageWindowsVersionsPage from './pages/ManageWindowsVersionsPage';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={user ? <DashboardPage /> : <PublicTicketListPage />}
            />
            <Route path="/faq" element={<PublicFaqPage />} />{" "}
            {/* 3. เพิ่ม Route สำหรับ Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<AdminManagementPage />} />
            <Route path="/public/tickets" element={<PublicTicketListPage />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/assets" element={<AssetListPage />} />
              <Route path="/add" element={<AddAssetPage />} />
              <Route path="/import" element={<ImportAssetsPage />} />
              <Route path="/add-data" element={<AddDataHubPage />} />
              <Route path="/edit/:assetId" element={<EditAssetPage />} />
              <Route path="/asset/:assetId" element={<AssetDetailPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/asset/history/:assetCode" element={<AssetTicketHistoryPage />} />
              <Route path="/create-user" element={<AdminManagementPage />} />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/switches" element={<SwitchListPage />} />
              <Route path="/switches/:switchId" element={<SwitchDetailPage />} />
              <Route path="/manage-faq" element={<FaqManagementPage />} />
            </Route>

            {/* ✨ 2. อัปเดตเฉพาะ Route ภายใต้ /settings ✨ */}
            <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
              <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
                <Route index element={<SettingsIndexPage />} />
                <Route path="category" element={<ManageCategoriesPage />} />
                <Route path="subcategory" element={<ManageSubCategoriesPage />} />
                ...
              </Route>
              <Route path="category" element={<ManageCategoriesPage />} />
              <Route path="subcategory" element={<ManageSubCategoriesPage />} />
              <Route path="brand" element={<ManageBrandsPage />} />
              <Route path="model" element={<ManageModelsPage />} />
              <Route path="ram" element={<ManageRamsPage />} />
              <Route path="storage" element={<ManageStoragesPage />} />
              <Route path="cpu" element={<ManageCpusPage />} />
              <Route path="asset_status" element={<ManageAssetStatusPage />} />
              <Route path="windows" element={<ManageWindowsVersionsPage />} />
              <Route path="office" element={<ManageOfficeVersionsPage />} />
              <Route path="antivirus" element={<ManageAntivirusPage />} />
              <Route path="special_program" element={<ManageAssetSpecialProgramsPage />} />
              <Route path="department" element={<ManageDepartmentsPage />} />
              <Route path="location" element={<ManageLocationsPage />} />
              <Route path="position" element={<ManagePositionsPage />} />
              <Route path="employee" element={<ManageEmployeesPage />} />
              <Route path="email" element={<ManageEmailsPage />} />
            </Route>

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;