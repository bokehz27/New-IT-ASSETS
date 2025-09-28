// src/pages/AssetListPage.js

import React, { useState, useEffect } from "react";
import api from "../api";
import AssetList from "../components/AssetList";
import { useSearchParams } from "react-router-dom";

function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(20);

  const [searchParams, setSearchParams] = useSearchParams();

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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, limit]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await api.delete(`/assets/${id}`);
        fetchAssets(currentPage, limit, searchTerm);
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

  return (
    <div>
      {/* ... Filter section remains the same ... */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Asset Name, Serial, Device Users, User ID"
            className="w-full pr-10"
          />
          {/* ... Clear button icon ... */}
        </div>
      </div>
      {loading ? (
        <div className="text-center p-10 text-gray-500">Loading assets...</div>
      ) : (
        <>
          <AssetList assets={assets} onDelete={handleDelete} />
          {/* ... Pagination section remains the same ... */}
        </>
      )}
    </div>
  );
}

export default AssetListPage;