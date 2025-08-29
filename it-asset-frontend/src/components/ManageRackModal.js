// src/components/ManageRackModal.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../api";

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
    >
      {children}
    </button>
  );
}

/**
 * Clean UI:
 * - Close เฉพาะที่ header
 * - ปุ่มหลักเดียวในฟอร์ม: Add / Update
 * - ปุ่มรอง Reset เฉพาะตอนแก้ไข
 * - แถวรายการใช้ icon แทนข้อความ Edit/Delete
 */
export default function ManageRackModal({ onClose }) {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // object | null
  const [form, setForm] = useState({ name: "", location: "" });
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ field: "name", dir: "asc" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchRacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/racks");
      setRacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch racks", err);
      setMsg({ type: "error", text: "Failed to load racks." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", location: "" });
    setMsg({ type: "", text: "" });
  };

  const startEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name || "", location: r.location || "" });
    setMsg({ type: "", text: "" });
  };

  const filteredSorted = useMemo(() => {
    let rows = racks;
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const fa = (a[sortBy.field] || "").toString().toLowerCase();
      const fb = (b[sortBy.field] || "").toString().toLowerCase();
      if (fa < fb) return sortBy.dir === "asc" ? -1 : 1;
      if (fa > fb) return sortBy.dir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [racks, query, sortBy]);

  const toggleSort = (field) => {
    setSortBy((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg({ type: "error", text: "Rack Name is required." });
      return;
    }
    try {
      setBusy(true);
      if (editing) {
        await api.put(`/racks/${editing.id}`, form);
        setMsg({ type: "success", text: "Rack updated." });
      } else {
        await api.post("/racks", form);
        setMsg({ type: "success", text: "Rack added." });
      }
      resetForm();
      fetchRacks();
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: `Failed to ${editing ? "update" : "add"} rack. Name might already exist.`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Delete this rack? All assets assigned to this rack will be unassigned."
    );
    if (!ok) return;
    try {
      setBusy(true);
      await api.delete(`/racks/${id}`);
      setMsg({ type: "success", text: "Rack deleted." });
      if (editing?.id === id) resetForm();
      fetchRacks();
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to delete rack." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Racks</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: List */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              {/* New -> reset form only */}
              <IconButton title="New" onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </IconButton>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b text-sm font-semibold">
                <button
                  className="col-span-5 text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => toggleSort("name")}
                  title="Sort by Name"
                >
                  Name {sortBy.field === "name" ? (sortBy.dir === "asc" ? "↑" : "↓") : ""}
                </button>
                <button
                  className="col-span-5 text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => toggleSort("location")}
                  title="Sort by Location"
                >
                  Location {sortBy.field === "location" ? (sortBy.dir === "asc" ? "↑" : "↓") : ""}
                </button>
                <div className="col-span-2 px-3 py-2 text-center"> </div>
              </div>

              <div className="max-h-[340px] overflow-auto divide-y">
                {loading ? (
                  <div className="px-3 py-10 text-center text-gray-500">Loading racks...</div>
                ) : filteredSorted.length === 0 ? (
                  <div className="px-3 py-10 text-center text-gray-500">No racks found.</div>
                ) : (
                  filteredSorted.map((rack) => (
                    <div key={rack.id} className="grid grid-cols-12 items-center px-3 py-2">
                      <div className="col-span-5 truncate" title={rack.name}>
                        {rack.name}
                      </div>
                      <div className="col-span-5 truncate text-gray-600" title={rack.location}>
                        {rack.location || "-"}
                      </div>
                      <div className="col-span-2 flex justify-center gap-1">
                        <IconButton title="Edit" onClick={() => startEdit(rack)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 21h4l11-11-4-4L4 17v4z" stroke="currentColor" strokeWidth="1.6"/>
                          </svg>
                        </IconButton>
                        <IconButton title="Delete" onClick={() => handleDelete(rack.id)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6 7h12M9 7V5h6v2m-7 3v8m8-8v8M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </IconButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rack Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Rack-01"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Server Room A / 2F"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {msg.text && (
                <div
                  className={`rounded-md px-3 py-2 text-sm ${
                    msg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : msg.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className={`text-white font-semibold py-2 px-5 rounded-md ${
                    editing
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } ${busy ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {busy ? (editing ? "Updating..." : "Adding...") : editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* ไม่มีปุ่ม Close ด้านล่างแล้ว เพื่อลดความซ้ำ */}
      </div>
    </div>
  );
}
