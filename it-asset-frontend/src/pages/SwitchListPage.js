// src/pages/SwitchListPage.js

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ManageRackModal from "../components/ManageRackModal";
import AddSwitchModal from "../components/AddSwitchModal";
import EditSwitchModal from "../components/EditSwitchModal";

// --- REDESIGNED ICONS ---
const RackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PageHeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


// --- REDESIGNED SUB-COMPONENTS ---

const SwitchInRack = ({ sw, onEdit, onDelete }) => (
  // 'group' class enables showing buttons on hover
  <div className="switch-item group relative flex items-center p-3 bg-gray-50 rounded-md border border-transparent hover:shadow-md hover:bg-white hover:border-gray-200 transition-all duration-200">
    <Link to={`/switches/${sw.id}`} className="flex-grow overflow-hidden cursor-pointer">
      <p className="font-semibold text-gray-800 truncate">{sw.name}</p>
      <p className="text-sm text-gray-500 truncate">
        {sw.ip_address ? `IP: ${sw.ip_address}` : (sw.model || "No model")}
      </p>
    </Link>
    {/* 'actions' class is the target for the CSS hover effect */}
    <div className="actions absolute right-3 flex flex-shrink-0 items-center gap-2">
      <button
        onClick={() => onEdit(sw)}
        className="p-1.5 rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition"
        title="Edit Switch"
      >
        <EditIcon />
      </button>
      <button
        onClick={() => onDelete(sw.id)}
        className="p-1.5 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition"
        title="Delete Switch"
      >
        <DeleteIcon />
      </button>
    </div>
  </div>
);

const RackCard = ({ title, switches, onEditSwitch, onDeleteSwitch }) => (
  <div className="bg-white rounded-lg shadow-sm border flex flex-col">
    {/* Header */}
    <div className="flex items-center p-4 border-b">
      <div className="flex-shrink-0 mr-3">
        <RackIcon />
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    {/* Body */}
    <div className="p-2 bg-white rounded-b-lg space-y-2 flex-grow">
      {switches && switches.length > 0 ? (
        switches.map((sw) => (
          <SwitchInRack
            key={sw.id}
            sw={sw}
            onEdit={onEditSwitch}
            onDelete={onDeleteSwitch}
          />
        ))
      ) : (
        <div className="flex items-center justify-center p-6 text-gray-400 text-sm">
          <p>No devices in this rack.</p>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

function SwitchListPage() {
  const [groupedRacks, setGroupedRacks] = useState({});
  const [unrackedSwitches, setUnrackedSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRackModal, setShowRackModal] = useState(false);
  const [showAddSwitchModal, setShowAddSwitchModal] = useState(false);
  const [editingSwitch, setEditingSwitch] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const racksRes = await api.get("/racks");
      const unrackedRes = await api.get("/switches?rackId=null");

      const grouped = racksRes.data.reduce((acc, rack) => {
        const location = rack.location || "Uncategorized";
        if (!acc[location]) acc[location] = [];
        acc[location].push(rack);
        return acc;
      }, {});

      setGroupedRacks(grouped);
      setUnrackedSwitches(unrackedRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSwitch = async (switchId) => {
    if (window.confirm("Are you sure you want to delete this switch?")) {
      try {
        await api.delete(`/switches/${switchId}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete switch.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-5 bg-white rounded-lg shadow-md border">
        <div className="flex items-center gap-4">
            <PageHeaderIcon />
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Switch Infrastructure
                </h1>
                <p className="text-gray-500">Overview of all network racks and devices.</p>
            </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRackModal(true)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Manage Racks
          </button>
          <button
            onClick={() => setShowAddSwitchModal(true)}
            className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
          >
            Add Switch
          </button>
        </div>
      </div>
      
      {error && <div className="text-red-500 p-4 bg-red-50 rounded-md text-center">{error}</div>}

      {/* --- CONTENT AREA --- */}
      <div className="space-y-10">
        {Object.entries(groupedRacks).map(([location, racksInLocation]) => (
          <section key={location}>
            <h2 className="text-xl font-bold text-gray-600 mb-4 ml-1">
              {location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {racksInLocation.map((rack) => (
                <RackCard
                  key={rack.id}
                  title={rack.name}
                  switches={rack.Switches}
                  onEditSwitch={setEditingSwitch}
                  onDeleteSwitch={handleDeleteSwitch}
                />
              ))}
            </div>
          </section>
        ))}

        {unrackedSwitches.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-600 mb-4 ml-1">
                Unassigned Devices
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-2 space-y-2">
              {unrackedSwitches.map((sw) => (
                <SwitchInRack
                  key={sw.id}
                  sw={sw}
                  onEdit={setEditingSwitch}
                  onDelete={handleDeleteSwitch}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- MODALS --- */}
      {showRackModal && <ManageRackModal onClose={() => { setShowRackModal(false); fetchData(); }} />}
      {showAddSwitchModal && <AddSwitchModal onClose={() => setShowAddSwitchModal(false)} onSwitchAdded={fetchData} />}
      {editingSwitch && <EditSwitchModal sw={editingSwitch} onClose={() => setEditingSwitch(null)} onSwitchUpdated={fetchData} />}
    </div>
  );
}

export default SwitchListPage;