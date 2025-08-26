import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  NavLink,
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
import CreateUserPage from "./pages/CreateUserPage";
import TicketFormPage from "./pages/TicketFormPage";
import TicketListPage from "./pages/TicketListPage";
import ManagementPage from "./pages/ManagementPage";
import AssetTicketHistoryPage from "./pages/AssetTicketHistoryPage";
import ImportAssetsPage from "./pages/ImportAssetsPage";
import AddDataHubPage from "./pages/AddDataHubPage";
import UserManagementPage from "./pages/UserManagementPage";
import DashboardPage from "./pages/DashboardPage";
import SwitchListPage from "./pages/SwitchListPage";
import SwitchDetailPage from "./pages/SwitchDetailPage";
import ReportPage from './pages/ReportPage';
// Protected Route
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
            <Route path="/register" element={<CreateUserPage />} />
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
              <Route path="/report" element={<ReportPage />} />
              <Route
                path="/asset/history/:assetCode"
                element={<AssetTicketHistoryPage />}
              />
              <Route path="/tickets" element={<TicketListPage />} />
              <Route path="/switches" element={<SwitchListPage />} />
              <Route
                path="/switches/:switchId"
                element={<SwitchDetailPage />}
              />
              {/* --- ส่วนของ Settings --- */}
              <Route path="/settings" element={<SettingsLayout />}>
  <Route
    path="category"
    element={
      <ManagementPage
        title="Manage Asset Categories"
        dataType="category"
      />
    }
  />
  <Route
    path="subcategory"
    element={
      <ManagementPage
        title="Manage Subcategories"
        dataType="subcategory"
      />
    }
  />
  <Route
    path="brand"
    element={
      <ManagementPage
        title="Manage Brands"
        dataType="brand"
      />
    }
  />
  <Route
    path="ram"
    element={
      <ManagementPage
        title="Manage RAM"
        dataType="ram"
      />
    }
  />
  <Route
    path="storage"
    element={
      <ManagementPage
        title="Manage Hard Disks"
        dataType="storage"
      />
    }
  />
  <Route
    path="department"
    element={
      <ManagementPage
        title="Manage Departments"
        dataType="department"
      />
    }
  />
  <Route
    path="location"
    element={
      <ManagementPage
        title="Manage Locations"
        dataType="location"
      />
    }
  />
  <Route path="users" element={<UserManagementPage />} />
  <Route
    path="repair-type"
    element={
      <ManagementPage
        title="Manage Repair Types"
        dataType="repair_type"
      />
    }
  />
  {/* --- New Routes for Software Management --- */}
  <Route
    path="windows"
    element={
      <ManagementPage
        title="Manage Windows Versions"
        dataType="windows"
      />
    }
  />
  <Route
    path="office"
    element={
      <ManagementPage
        title="Manage Office Versions"
        dataType="office"
      />
    }
  />
  <Route
    path="antivirus"
    element={
      <ManagementPage
        title="Manage Antivirus Programs"
        dataType="antivirus"
      />
    }
  />
  <Route
    path="special_program"
    element={
      <ManagementPage
        title="Manage Special Programs"
        dataType="special_program"
      />
    }
  />
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