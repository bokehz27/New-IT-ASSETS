import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "primereact/button";

/* ================================
   Modal Form (Create / Update)
================================ */
function PasswordFormModal({ mode, entryId, onSuccess, onCancel }) {
  const isEdit = mode === "update";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    username: "",
    password: "",
  });

  /* Load data when editing */
  useEffect(() => {
    const fetchEntry = async () => {
      if (!isEdit || !entryId) return;

      try {
        setInitialLoading(true);
        const res = await api.get(`/passwords/${entryId}`);
        const e = res.data;

        setFormData({
          name: e.name || "",
          url: e.url || "",
          username: e.username || "",
          password: e.password || "",
        });
      } catch (err) {
        alert("Failed to load password entry.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEntry();
  }, [isEdit, entryId]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("กรุณากรอก Name");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await api.put(`/passwords/${entryId}`, formData);
      } else {
        await api.post("/passwords", formData);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save password entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {isEdit ? "Edit Password Entry" : "Create Password Entry"}
          </h3>

          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Loading */}
        {initialLoading ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={formData.name}
                onChange={handleChange("name")}
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={formData.url}
                onChange={handleChange("url")}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={formData.username}
                onChange={handleChange("username")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={formData.password}
                onChange={handleChange("password")}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-lg border text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#0d47a1] to-[#1976d2] text-white font-semibold"
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

/* ================================
   Main Page
================================ */
function PasswordVaultPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const [search, setSearch] = useState("");

  /* Track password visibility */
  const [visiblePasswords, setVisiblePasswords] = useState({});

  /* Fetch list */
  const fetchEntries = useCallback(async () => {
    setLoading(true);

    try {
      const params = search ? { params: { q: search } } : {};
      const res = await api.get("/passwords", params);

      setEntries(res.data);
    } catch (err) {
      console.error("Failed to fetch passwords", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /* Modal handlers */
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedEntryId(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (id) => {
    setModalMode("update");
    setSelectedEntryId(id);
    setIsFormModalOpen(true);
  };

  const closeModal = () => {
    setIsFormModalOpen(false);
    setSelectedEntryId(null);
  };

  const handleSuccess = () => {
    closeModal();
    fetchEntries();
  };

  /* Delete */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this password entry?")) return;

    try {
      await api.delete(`/passwords/${id}`);
      fetchEntries();
    } catch (err) {
      alert("Failed to delete entry.");
    }
  };

  /* Toggle password visibility */
  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* Format date */
  const formatDate = (d) => {
    if (!d) return "-";
    const dateStr = d.slice(0, 10);
    const [y, m, day] = dateStr.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] to-[#2196f3] bg-clip-text text-transparent">
          Password Vault
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Store department credentials securely (internal use).
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow flex items-center gap-2"
        >
          <FaPlus />
          <span>Create Entry</span>
        </button>

        {/* Search */}
        <div className="relative w-full md:w-80 md:ml-auto">
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-4 pr-4 py-2 text-sm border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchEntries();
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center p-16 text-slate-500">Loading...</div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">URL</th>
                <th className="p-3">Username</th>
                <th className="p-3 text-center">Password</th>
                <th className="p-3 text-center">Last Updated</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No password records.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium">{e.name}</td>

                    <td className="p-3 text-blue-600">
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noreferrer">
                          {e.url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3">{e.username || "-"}</td>

                    {/* Password */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Password Text */}
                        <span className="font-mono">
                          {visiblePasswords[e.id] ? e.password : "••••••••"}
                        </span>

                        {/* Eye Button */}
                        <button
                          onClick={() => togglePassword(e.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full
                 hover:bg-slate-100 text-blue-600 transition"
                          title={
                            visiblePasswords[e.id]
                              ? "Hide Password"
                              : "Show Password"
                          }
                        >
                          {visiblePasswords[e.id] ? (
                            <FaEyeSlash size={16} />
                          ) : (
                            <FaEye size={16} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="p-3 text-center">
                      {formatDate(e.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <Button
                          icon="pi pi-pencil"
                          className="p-button-rounded p-button-success p-button-sm"
                          onClick={() => openEditModal(e.id)}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger p-button-sm"
                          onClick={() => handleDelete(e.id)}
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
        <PasswordFormModal
          mode={modalMode}
          entryId={selectedEntryId}
          onSuccess={handleSuccess}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}

export default PasswordVaultPage;
