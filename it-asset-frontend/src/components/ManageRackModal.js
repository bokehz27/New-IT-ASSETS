// src/components/ManageRackModal.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../api";

function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`p-2 rounded-full transition-colors ${className}`}>
      {children}
    </button>
  );
}

export default function ManageRackModal({ onClose }) {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
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

  useEffect(() => { fetchRacks() }, [fetchRacks]);

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
    let rows = racks.filter(r => 
        r.name?.toLowerCase().includes(query.toLowerCase()) || 
        r.location?.toLowerCase().includes(query.toLowerCase())
    );
    return [...rows].sort((a, b) => {
      const fa = (a[sortBy.field] || "").toLowerCase();
      const fb = (b[sortBy.field] || "").toLowerCase();
      if (fa < fb) return sortBy.dir === "asc" ? -1 : 1;
      if (fa > fb) return sortBy.dir === "asc" ? 1 : -1;
      return 0;
    });
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
    setBusy(true);
    try {
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
      setMsg({ type: "error", text: `Failed to ${editing ? "update" : "add"} rack.` });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rack?")) return;
    setBusy(true);
    try {
      await api.delete(`/racks/${id}`);
      setMsg({ type: "success", text: "Rack deleted." });
      if (editing?.id === id) resetForm();
      fetchRacks();
    } catch (err) {
      setMsg({ type: "error", text: "Failed to delete rack." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Manage Racks</h2>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20">
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 bg-slate-50">
          {/* LEFT: List */}
          <div className="lg:col-span-3 bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
                className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm"
              />
              <button onClick={resetForm} title="Add New Rack" className="px-3 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50">
                New
              </button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50 border-b text-sm font-semibold text-slate-600">
                <button className="col-span-5 text-left px-3 py-2 hover:bg-slate-100" onClick={() => toggleSort("name")}>
                  Name {sortBy.field === 'name' && (sortBy.dir === 'asc' ? '▲' : '▼')}
                </button>
                <button className="col-span-5 text-left px-3 py-2 hover:bg-slate-100" onClick={() => toggleSort("location")}>
                  Location {sortBy.field === 'location' && (sortBy.dir === 'asc' ? '▲' : '▼')}
                </button>
              </div>
              <div className="max-h-[340px] overflow-auto divide-y divide-slate-100">
                {loading ? <div className="p-10 text-center text-slate-500">Loading...</div> : 
                 filteredSorted.length === 0 ? <div className="p-10 text-center text-slate-500">No racks found.</div> :
                 filteredSorted.map((rack) => (
                    <div key={rack.id} className="grid grid-cols-12 items-center px-3 py-2 text-sm">
                      <div className="col-span-5 truncate font-medium text-slate-800">{rack.name}</div>
                      <div className="col-span-5 truncate text-slate-500">{rack.location || "-"}</div>
                      <div className="col-span-2 flex justify-center gap-1">
                        <IconButton title="Edit" onClick={() => startEdit(rack)} className="text-blue-600 hover:bg-blue-100"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></IconButton>
                        <IconButton title="Delete" onClick={() => handleDelete(rack.id)} className="text-red-600 hover:bg-red-100"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg></IconButton>
                      </div>
                    </div>
                 ))
                }
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rack Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Rack-01"
                  className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (optional)</label>
                <input name="location" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Server Room A"
                  className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm"
                />
              </div>

              {msg.text && (
                <div className={`rounded-md px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {msg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                {editing && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">
                    Cancel Edit
                  </button>
                )}
                <button type="submit" disabled={busy} className={`bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 ${busy ? "opacity-70 cursor-not-allowed" : ""}`}>
                  {busy ? (editing ? "Updating..." : "Adding...") : (editing ? "Update Rack" : "Add Rack")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}