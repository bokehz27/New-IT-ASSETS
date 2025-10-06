// src/components/EditPortModal.js
import React, { useMemo, useState } from "react";
import SearchableDropdown from "./SearchableDropdown";

function EditPortModal({ port, onClose, onSave }) {
  const [lanCableId, setLanCableId] = useState(port.lanCableId || "");
  const [vlan, setVlan] = useState(port.vlan || "");
  const [notes, setNotes] = useState(port.notes || "");
  const [status, setStatus] = useState(port.status || "Disabled");

  const statusOptions = useMemo(() => [
    { value: "Up", label: "Up" },
    { value: "Down", label: "Down" },
    { value: "Up Link", label: "Up Link" },
    { value: "Disabled", label: "Disabled" },
  ], []);

  const handleSave = () => {
    onSave(port.id, { lanCableId, vlan, notes, status });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white">
            <h3 className="text-lg font-semibold">Edit Port #{port.portNumber}</h3>
        </div>
        
        {/* Form Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LAN Cable ID</label>
            <input type="text" value={lanCableId} onChange={(e) => setLanCableId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" placeholder="e.g., LAN-A01-024" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">VLAN</label>
            <input type="text" value={vlan} onChange={(e) => setVlan(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" placeholder="e.g., 101, 205" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm" rows="3" placeholder="Additional details..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <SearchableDropdown options={statusOptions} value={status} onChange={setStatus} placeholder="-- Select status --" idPrefix="dd-port-status" menuZIndex={10000} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPortModal;