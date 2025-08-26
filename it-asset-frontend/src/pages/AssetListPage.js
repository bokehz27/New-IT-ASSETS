// src/pages/AssetListPage.js (ตัวอย่าง Path)

import React, { useState, useEffect } from "react";
// --- CHANGE 1: นำเข้า api instance แทน axios โดยตรง ---
import api from "../api"; // <-- ปรับ path ตามโครงสร้างโปรเจกต์
import AssetList from "../components/AssetList";
import { useSearchParams } from "react-router-dom";

// --- CHANGE 2: ลบตัวแปร API_URL ที่ไม่จำเป็นออกไป ---
// const API_URL = "http://172.18.1.61:5000/api/assets";

function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(20);

  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "";

  const fetchAssets = async (
    page,
    currentLimit,
    searchQuery,
    currentFilter
  ) => {
    try {
      setLoading(true);
      // --- CHANGE 3: ใช้ api instance ซึ่งจะแนบ token ไปกับ request โดยอัตโนมัติ ---
      const response = await api.get("/assets", {
        params: {
          search: searchQuery,
          page: page,
          limit: currentLimit,
          filter: currentFilter,
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
      const pageToFetch = searchTerm ? 1 : currentPage;
      fetchAssets(pageToFetch, limit, searchTerm, filter);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, limit, filter]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        // --- CHANGE 4: ใช้ api instance สำหรับการลบข้อมูลเช่นกัน ---
        await api.delete(`/assets/${id}`);
        fetchAssets(currentPage, limit, searchTerm, filter);
      } catch (error) {
        console.error("Error deleting asset:", error);
        alert("Failed to delete asset.");
      }
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  // --- ส่วน JSX ไม่มีการเปลี่ยนแปลง ---
  return (
    <div>
      <div>
        {filter === "incomplete" && (
          <div
            className="p-4 mb-4 text-orange-800 bg-orange-100 border-l-4 border-orange-500 rounded"
            role="alert"
          >
            <h2 className="font-bold">Filtered View</h2>
            <p>Show only assets with incomplete data.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IT Asset, Device Users, User ID, IP Address"
            className="w-full pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-red-500 transition"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {filter && (
            <button
              onClick={() => setSearchParams({})}
              className="bg-gray-200 text-gray-700 whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 text-gray-500">Loading assets...</div>
      ) : (
        <>
          <AssetList assets={assets} onDelete={handleDelete} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select value={limit} onChange={handleLimitChange}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({totalItems} items)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-gray-200 text-gray-700 disabled:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 text-gray-700 disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AssetListPage;