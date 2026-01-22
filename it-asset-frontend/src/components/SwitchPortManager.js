import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import EditPortModal from "./EditPortModal";

/* =========================
   Status Style
========================= */
const STATUS_STYLE = {
  Up: "border-emerald-500 bg-emerald-100 text-emerald-700",
  "Up Link": "border-blue-500 bg-blue-100 text-blue-700",
  Down: "border-red-500 bg-red-100 text-red-700",
  Disabled: "border-gray-300 bg-gray-100 text-gray-400",
};

/* =========================
   Compact Port Slot
========================= */
const PortSlot = ({ port, onClick }) => {
  return (
    <div
      onClick={onClick}
      title={port.notes || ""}
      className={`
        relative w-[56px] h-[56px]
        border rounded-md
        cursor-pointer select-none
        transition hover:shadow-md hover:-translate-y-[1px]
        ${STATUS_STYLE[port.status] || STATUS_STYLE.Disabled}
      `}
    >
      {/* Port Number (Top-Left) */}
      <div className="absolute top-[2px] left-[4px] text-[9px] font-bold opacity-70">
        P{port.portNumber}
      </div>

      {/* Note Icon (Top-Right) */}
      {port.notes && (
        <div className="absolute top-[2px] right-[4px] text-[10px] text-yellow-500">
          📝
        </div>
      )}

      {/* LAN Cable No (Main) */}
      <div className="flex h-full items-center justify-center px-1">
        <div
          className="text-[13px] font-extrabold leading-none truncate max-w-[48px]"
          title={port.lanCableId || ""}
        >
          {port.lanCableId || "—"}
        </div>
      </div>
    </div>
  );
};

/* =========================
   Main Component
========================= */
function SwitchPortManager({ switchId }) {
  const [ports, setPorts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPort, setEditingPort] = useState(null);

  /* =========================
     Fetch Ports
  ========================= */
  const fetchPorts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/switches/${switchId}/ports`);

      const sorted = [...res.data].sort(
        (a, b) => a.portNumber - b.portNumber
      );

      // Switch style: Top = Odd, Bottom = Even
      const odd = sorted.filter((p) => p.portNumber % 2 !== 0);
      const even = sorted.filter((p) => p.portNumber % 2 === 0);

      setPorts(sorted);
      setRows([odd, even]);
      setError(null);
    } catch {
      setError("Failed to load ports.");
    } finally {
      setLoading(false);
    }
  }, [switchId]);

  useEffect(() => {
    if (switchId) fetchPorts();
  }, [switchId, fetchPorts]);

  /* =========================
     Save
  ========================= */
  const handleSavePort = async (portId, data) => {
    try {
      await api.put(`/ports/${portId}`, data);
      setEditingPort(null);
      fetchPorts();
    } catch {
      alert("Save failed");
    }
  };

  /* =========================
     Render
  ========================= */
  if (loading)
    return <div className="p-4 text-center text-gray-500">Loading…</div>;

  if (error)
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="rounded-xl bg-white shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-wide">
          Switch Port Layout
        </h2>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] font-semibold">
          <span className="text-emerald-600">● UP</span>
          <span className="text-blue-600">● UPLINK</span>
          <span className="text-red-600">● DOWN</span>
          <span className="text-gray-400">● DISABLED</span>
        </div>
      </div>

      {/* Switch Panel */}
      {ports.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          No ports found
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex gap-1 justify-center">
              {row.map((port) => (
                <PortSlot
                  key={port.id}
                  port={port}
                  onClick={() => setEditingPort(port)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
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
