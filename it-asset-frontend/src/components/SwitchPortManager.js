// src/components/SwitchPortManager.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import EditPortModal from "./EditPortModal";

// Note Icon Component
const NoteIcon = () => (
  <div className="port-slot-note-icon" title="This port has notes">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5 5a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3H8a3 3 0 01-3-3V5zm3 0a1 1 0 000 2h8a1 1 0 100-2H8z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

function SwitchPortManager({ switchId }) {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPort, setEditingPort] = useState(null);
  const [portRows, setPortRows] = useState([]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Up":
        return "status-up";
      case "Up Link":
        return "status-uplink";
      case "Down":
        return "status-down";
      case "Disabled":
      default:
        return "status-disabled";
    }
  };

  const fetchPorts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/switches/${switchId}/ports`);
      const sortedPorts = response.data.sort(
        (a, b) => a.portNumber - b.portNumber
      );

      // --- LOGIC REVERT: กลับไปใช้การแบ่งกลุ่มแบบเลขคู่/เลขคี่ ---
      const oddPorts = sortedPorts.filter((p) => p.portNumber % 2 !== 0);
      const evenPorts = sortedPorts.filter((p) => p.portNumber % 2 === 0);

      const rows = [];
      if (oddPorts.length > 0) rows.push(oddPorts);
      if (evenPorts.length > 0) rows.push(evenPorts);
      setPortRows(rows);

      setPorts(sortedPorts);
      setError(null);
    } catch (err) {
      setError("Failed to load ports for this asset.");
    } finally {
      setLoading(false);
    }
  }, [switchId]);

  useEffect(() => {
    if (switchId) {
      fetchPorts();
    }
  }, [switchId, fetchPorts]);

  const handleSavePort = async (portId, dataToUpdate) => {
    try {
      await api.put(`/ports/${portId}`, dataToUpdate);
      setEditingPort(null);
      fetchPorts();
    } catch (err) {
      alert("Failed to save port details.");
    }
  };

  if (loading) return <div className="text-center p-4">Loading ports...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Switch Port Status</h2>
      </div>

      {ports.length === 0 ? (
        <p className="p-6 text-gray-500">No ports found for this device.</p>
      ) : (
        <div className="p-4">
          <div className="switch-panel">
            {portRows.map((row, rowIndex) => (
              <div key={rowIndex} className="port-row">
                {row.map((port) => {
                  const tooltipText = port.notes || "";
                  return (
                    <div
                      key={port.id}
                      onClick={() => setEditingPort(port)}
                      className={`port-slot ${getStatusClass(port.status)}`}
                      title={tooltipText}
                    >
                      {port.notes && <NoteIcon />}
                      <div className="port-slot-number">{port.portNumber}</div>
                      <div className="port-slot-info">
                        {port.lanCableId || "----"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {editingPort && (
        <EditPortModal
          port={editingPort}
          onClose={() => setEditingPort(null)}
          onSave={handleSavePort}
        />
      )}
    </div>
  );
}

export default SwitchPortManager;
