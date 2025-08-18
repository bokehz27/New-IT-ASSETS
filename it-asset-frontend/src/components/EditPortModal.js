// src/components/EditPortModal.js
import React, { useState } from 'react';

function EditPortModal({ port, onClose, onSave }) {
  const [lanCableId, setLanCableId] = useState(port.lanCableId || '');
  // const [connectedTo, setConnectedTo] = useState(port.connectedTo || ''); // <-- ลบ State นี้
  const [vlan, setVlan] = useState(port.vlan || '');
  const [notes, setNotes] = useState(port.notes || '');
  const [status, setStatus] = useState(port.status || 'Disabled');

  const handleSave = () => {
    onSave(port.id, {
      lanCableId,
      vlan, // เพิ่ม vlan
      notes,
      status,
      // ไม่ต้องส่ง connectedTo กลับไป
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-slide-down">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Port #{port.portNumber}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">LAN Cable ID</label>
            <input
              type="text"
              value={lanCableId}
              onChange={(e) => setLanCableId(e.target.value)}
              className="w-full"
              placeholder="e.g., LAN-A01-024"
            />
          </div>

          {/* ลบ Input ของ Connected To ออก */}

          <div>
            <label className="block text-sm font-medium text-gray-700">VLAN</label>
            <input
              type="text"
              value={vlan}
              onChange={(e) => setVlan(e.target.value)}
              className="w-full"
              placeholder="e.g., 101, 205"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows="3"
              placeholder="Additional details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full"
            >
              <option value="Up">Up</option>
              <option value="Down">Down</option>
              <option value="Up Link">Up Link</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPortModal;