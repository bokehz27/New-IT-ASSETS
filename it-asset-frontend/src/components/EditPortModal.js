// src/components/EditPortModal.js
import React, { useMemo, useState } from "react";
import SearchableDropdown from "./SearchableDropdown"; // ปรับ path ให้ตรงโปรเจกต์

function EditPortModal({ port, onClose, onSave }) {
  const [lanCableId, setLanCableId] = useState(port.lanCableId || "");
  const [vlan, setVlan] = useState(port.vlan || "");
  const [notes, setNotes] = useState(port.notes || "");
  const [status, setStatus] = useState(port.status || "Disabled");

  const statusOptions = useMemo(
    () => [
      { value: "Up", label: "Up" },
      { value: "Down", label: "Down" },
      { value: "Up Link", label: "Up Link" },
      { value: "Disabled", label: "Disabled" },
    ],
    []
  );

  const handleSave = () => {
    onSave(port.id, {
      lanCableId,
      vlan,
      notes,
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9990]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          Edit Port #{port.portNumber}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LAN Cable ID
            </label>
            <input
              type="text"
              value={lanCableId}
              onChange={(e) => setLanCableId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g., LAN-A01-024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VLAN
            </label>
            <input
              type="text"
              value={vlan}
              onChange={(e) => setVlan(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g., 101, 205"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows="3"
              placeholder="Additional details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SearchableDropdown
              options={statusOptions}
              value={status}
              onChange={setStatus}
              placeholder="-- Select status --"
              idPrefix="dd-port-status"
              menuZIndex={10000}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPortModal;
