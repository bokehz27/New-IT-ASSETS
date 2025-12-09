// pages/VendorManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Button } from "primereact/button";

// Modal form ด้านล่างจะประกาศในไฟล์นี้เลย
function VendorFormModal({ mode, vendorId, onSuccess, onCancel }) {
  const isEdit = mode === "update";
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    company_name: "",
    vendor_name: "",
    contact_detail: "",
    phone_number: "",
    // last_contact_date ถูกตัดออกแล้ว
  });

  // โหลดข้อมูลตอนแก้ไข
  useEffect(() => {
    const fetchVendor = async () => {
      if (!isEdit || !vendorId) return;
      try {
        setInitialLoading(true);
        const res = await api.get(`/vendors/${vendorId}`);
        const v = res.data;
        setFormData({
          company_name: v.company_name || "",
          vendor_name: v.vendor_name || "",
          contact_detail: v.contact_detail || "",
          phone_number: v.phone_number || "",
        });
      } catch (err) {
        alert("Failed to load vendor data.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchVendor();
  }, [isEdit, vendorId]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      alert("กรุณากรอกชื่อบริษัท");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        // ไม่ส่ง last_contact_date แล้ว ปล่อยให้ backend ใช้ updatedAt เป็น last updated
      };

      if (isEdit) {
        await api.put(`/vendors/${vendorId}`, payload);
      } else {
        await api.post("/vendors", payload);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {isEdit ? "Edit Vendor" : "Create Vendor"}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {initialLoading ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                value={formData.company_name}
                onChange={handleChange("company_name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                value={formData.vendor_name}
                onChange={handleChange("vendor_name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Detail
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] min-h-[80px]"
                value={formData.contact_detail}
                onChange={handleChange("contact_detail")}
              />
            </div>

            {/* 🔹 ขยายช่องเบอร์ให้กว้างขึ้น (เต็มแถว) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                value={formData.phone_number}
                onChange={handleChange("phone_number")}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#0d47a1] to-[#1976d2] text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function VendorManagementPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "update"
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { params: { q: search } } : {};
      const res = await api.get("/vendors", params);
      setVendors(res.data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedVendorId(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (id) => {
    setModalMode("update");
    setSelectedVendorId(id);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedVendorId(null);
  };

  const handleFormSuccess = () => {
    closeFormModal();
    fetchVendors();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await api.delete(`/vendors/${id}`);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to delete vendor.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const dateStr = d.length > 10 ? d.slice(0, 10) : d;
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return d;
    return `${day}/${month}/${year}`; // dd/mm/yyyy
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header + Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
            Vendor Contacts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Store information about contacted companies, vendors, contact numbers, and the latest update date.
          </p>
        </div>
      </div>

<div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

  {/* Create Vendor Button */}
  <button
    onClick={openCreateModal}
    className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 flex items-center gap-2"
  >
    <FaPlus />
    <span>Create Vendor</span>
  </button>

  {/* Search box */}
  <div className="flex-1">
    <div className="relative w-full md:w-80 md:ml-auto">
      <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="search"
        placeholder="Search vendors..."
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
        value={search}
        onChange={(e) => setSearch(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter") fetchVendors();
        }}
      />
    </div>
  </div>

</div>



      {/* Table */}
      {loading ? (
        <div className="text-center p-16 text-slate-500">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
              <tr>
                <th className="p-3 font-semibold w-1/4">Company</th>
                <th className="p-3 font-semibold w-1/5">Vendor</th>
                <th className="p-3 font-semibold">Detail</th>
                {/* 🔹 ขยายคอลัมน์ Phone ให้กว้างขึ้น */}
                <th className="p-3 font-semibold w-[200px]">Phone</th>
                <th className="p-3 font-semibold w-[150px] text-center">
                  Last Updated
                </th>
                <th className="p-3 font-semibold w-[120px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No vendor records.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 align-middle font-medium text-slate-900">
                      {v.company_name}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      {v.vendor_name || "-"}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      {v.contact_detail
                        ? v.contact_detail.length > 80
                          ? v.contact_detail.slice(0, 80) + "..."
                          : v.contact_detail
                        : "-"}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      {v.phone_number || "-"}
                    </td>
                    <td className="p-3 align-middle text-center text-slate-700">
                      {v.updatedAt ? formatDate(v.updatedAt) : "-"}
                    </td>
                    <td className="p-3 align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
  <Button
    icon="pi pi-pencil"
    className="p-button-rounded p-button-success p-button-sm"
    onClick={() => openEditModal(v.id)}
  />
  <Button
    icon="pi pi-trash"
    className="p-button-rounded p-button-danger p-button-sm"
    onClick={() => handleDelete(v.id)}
  />
</div>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isFormModalOpen && (
        <VendorFormModal
          mode={modalMode}
          vendorId={selectedVendorId}
          onSuccess={handleFormSuccess}
          onCancel={closeFormModal}
        />
      )}
    </div>
  );
}

export default VendorManagementPage;
