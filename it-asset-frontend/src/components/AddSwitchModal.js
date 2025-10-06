// src/components/AddSwitchModal.js
import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import SearchableDropdown from "./SearchableDropdown";

function AddSwitchModal({ onClose, onSwitchAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    port_count: "",
    ip_address: "",
    rackId: "",
  });
  const [racks, setRacks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRacks() {
      try {
        const res = await api.get("/racks");
        setRacks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch racks", err);
      }
    }
    fetchRacks();
  }, []);

  const rackOptions = useMemo(
    () =>
      racks.map((r) => ({
        value: r.id,
        label: r.location ? `${r.name} (${r.location})` : r.name,
      })),
    [racks]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.model || !formData.port_count) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await api.post("/switches", formData);
      onSwitchAdded();
      onClose();
    } catch (err) {
      setError("Failed to add switch. Please check your input.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white">
          <h2 className="text-lg font-semibold">Add New Switch</h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Switch Name *" className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" required />
          <input name="model" value={formData.model} onChange={handleChange} placeholder="Model *" className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" required />
          <input type="number" name="port_count" value={formData.port_count} onChange={handleChange} placeholder="Number of Ports *" className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" required />
          <input name="ip_address" value={formData.ip_address} onChange={handleChange} placeholder="IP Address" className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rack</label>
            <SearchableDropdown options={rackOptions} value={formData.rackId} onChange={(val) => setFormData((p) => ({ ...p, rackId: val }))} placeholder="--- Select a Rack ---" idPrefix="dd-add-rack" menuZIndex={10000} />
          </div>
        
          {/* Footer */}
          <div className="flex justify-end items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90">
              Save Switch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSwitchModal;