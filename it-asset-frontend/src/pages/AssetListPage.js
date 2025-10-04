// src/pages/AssetListPage.js

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";

// PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";

// Icon imports
import { FaLaptop, FaServer, FaHdd, FaBoxOpen } from "react-icons/fa";

// --- Helper Component (วางไว้นอกฟังก์ชันหลัก) ---
const AssetIcon = ({ category }) => {
  const iconMap = {
    Notebook: <FaLaptop className="text-2xl text-blue-500" />,
    Server: <FaServer className="text-2xl text-gray-700" />,
    Storage: <FaHdd className="text-2xl text-green-500" />,
    default: <FaBoxOpen className="text-2xl text-gray-400" />,
  };
  return iconMap[category] || iconMap.default;
};

function AssetListPage() {
  // --- State Management ---
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10); // Default rows per page for DataTable
  const dt = useRef(null);

  // --- Data Fetching ---
  const fetchAssets = async (page, currentLimit, searchQuery) => {
    try {
      setLoading(true);
      const response = await api.get("/assets", {
        params: {
          search: searchQuery,
          page: page,
          limit: currentLimit,
        },
      });
      setAssets(response.data.assets);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets(currentPage, limit, searchTerm);
    }, 300); // Debounce search input

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, limit]);

  // --- Event Handlers ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await api.delete(`/assets/${id}`);
        fetchAssets(currentPage, limit, searchTerm); // Refresh data
      } catch (error) {
        console.error("Error deleting asset:", error);
        alert("Failed to delete asset.");
      }
    }
  };

  // --- UI Templates for DataTable ---
  const leftToolbarTemplate = () => (
    <Link to="/asset/new">
      <Button
        label="New Asset"
        icon="pi pi-plus"
        className="luxury-gradient-btn text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:opacity-90 transition-all"
      />
    </Link>
  );
  
  const rightToolbarTemplate = () => (
    <div className="relative w-full md:w-80">
      <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <InputText
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search assets..."
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
      />
    </div>
  );

  const pictureBodyTemplate = (rowData) => (
    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-md">
      <AssetIcon category={rowData.category} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Link to={`/asset/${rowData.id}`}>
        <Button
          icon="pi pi-eye"
          tooltip="Detail"
          tooltipOptions={{ position: 'top' }}
          className="p-button-rounded p-button-info p-button-sm"
        />
      </Link>
      <Link to={`/asset/history/${rowData.asset_name}`}>
        <Button
          icon="pi pi-history"
          tooltip="History"
          tooltipOptions={{ position: 'top' }}
          className="p-button-rounded p-button-secondary p-button-sm"
        />
      </Link>
      <Button
        icon="pi pi-trash"
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        Asset List
      </h1>

      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <div className="overflow-x-auto">
        <DataTable
          ref={dt}
          value={assets}
          dataKey="id"
          paginator
          rows={limit}
          rowsPerPageOptions={[10, 20, 50]}
          onPage={(e) => {
            setCurrentPage(e.page + 1);
            setLimit(e.rows);
          }}
          lazy
          totalRecords={totalItems}
          loading={loading}
          rowHover
          emptyMessage="No assets found."
          className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
        >
            <Column
              header="Picture"
              body={pictureBodyTemplate}
              style={{ width: "100px", textAlign: 'center' }}
              headerClassName="text-sm"
            />
            <Column
              field="category"
              header="Category"
              sortable
              style={{ minWidth: "100px" }}
              bodyClassName="text-gray-800 text-xs"
              headerClassName="text-sm"
            />
            <Column
              field="asset_name"
              header="IT Asset"
              sortable
              style={{ minWidth: "100px" }}
              bodyClassName="text-gray-800 text-xs font-medium"
              headerClassName="text-sm"
            />
            
            <Column
              field="department"
              header="Department"
              sortable
              style={{ minWidth: "100px" }}
              bodyClassName="text-gray-800 text-xs"
              headerClassName="text-sm"
            />
            <Column
              field="user_name"
              header="Device User"
              sortable
              style={{ minWidth: "130px" }}
              bodyClassName="text-gray-800 text-xs"
              headerClassName="text-sm"
            />
            <Column
              field="user_id"
              header="User ID"
              sortable
              style={{ minWidth: "100px" }}
              bodyClassName="text-gray-800 text-xs"
              headerClassName="text-sm"
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: "100px", textAlign: 'center' }}
              bodyClassName="text-gray-800 text-xs"
              headerClassName="text-sm"
            />
        </DataTable>
      </div>
    </div>
  );
}

export default AssetListPage;