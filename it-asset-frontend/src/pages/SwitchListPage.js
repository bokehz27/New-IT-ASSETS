// src/pages/SwitchListPage.js

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ManageRackModal from "../components/ManageRackModal";
import AddSwitchModal from "../components/AddSwitchModal";
import EditSwitchModal from "../components/EditSwitchModal";
import { toast } from "react-toastify";

// --- ICONS (ใช้ไอคอนเดิม แต่ปรับแก้ className ให้รับ Tailwind CSS ได้) ---

const RackIcon = ({ className = "h-6 w-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);
const EditIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const DeleteIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const PageHeaderIcon = ({ className = "h-10 w-10" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);
const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);
const GridViewIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);
const ListViewIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
    />
  </svg>
);

// --- [NEW DESIGN] SUB-COMPONENTS ---

const SwitchListItem = ({ sw, onEdit, onDelete }) => (
  <div className="group flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors">
    <Link to={`/switches/${sw.id}`} className="flex-grow overflow-hidden pr-4">
      <p className="font-semibold text-slate-800 truncate">{sw.name}</p>
      <p className="text-sm text-slate-500 truncate">
        {sw.ip_address
          ? `IP: ${sw.ip_address}`
          : sw.model || "No model assigned"}
      </p>
    </Link>
    {/* ซ่อนปุ่มไว้ และแสดงเมื่อ Hover ที่ parent (.group) */}
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(sw)}
        className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
        title="Edit Switch"
      >
        <EditIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(sw.id)}
        className="p-2 rounded-full hover:bg-red-100 text-red-600"
        title="Delete Switch"
      >
        <DeleteIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const RackCard = ({ rack, onEditSwitch, onDeleteSwitch }) => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
    <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50">
      <RackIcon className="h-5 w-5 text-slate-500" />
      <h3 className="font-bold text-slate-800 truncate">{rack.name}</h3>
    </div>
    <div className="p-2 space-y-1">
      {rack.Switches && rack.Switches.length > 0 ? (
        rack.Switches.map((sw) => (
          <SwitchListItem
            key={sw.id}
            sw={sw}
            onEdit={onEditSwitch}
            onDelete={onDeleteSwitch}
          />
        ))
      ) : (
        <div className="text-center py-8 px-4 text-sm text-slate-500">
          <p>No devices in this rack.</p>
        </div>
      )}
    </div>
  </div>
);

const RackRow = ({ rack, onEditSwitch, onDeleteSwitch }) => (
  <div className="bg-white border border-slate-200 rounded-lg">
    <div className="flex items-center gap-3 p-3 border-b border-slate-200">
      <RackIcon className="h-5 w-5 text-slate-500" />
      <h3 className="font-bold text-slate-800">{rack.name}</h3>
    </div>
    <div className="divide-y divide-slate-100">
      {rack.Switches && rack.Switches.length > 0 ? (
        rack.Switches.map((sw) => (
          <SwitchListItem
            key={sw.id}
            sw={sw}
            onEdit={onEditSwitch}
            onDelete={onDeleteSwitch}
          />
        ))
      ) : (
        <div className="text-sm text-slate-500 italic px-4 py-3">
          No devices in this rack.
        </div>
      )}
    </div>
  </div>
);

const LocationHeader = ({ location, racks, onToggle, isCollapsed }) => {
  const deviceCount = racks.reduce(
    (acc, rack) => acc + (rack.Switches?.length || 0),
    0
  );
  const rackCount = racks.length;

  return (
    <button
      className="w-full flex justify-between items-center p-3 px-4 bg-white border-b border-slate-200 rounded-t-lg"
      onClick={onToggle}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">{location}</h2>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            {rackCount} Racks
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            {deviceCount} Devices
          </span>
        </div>
      </div>
      <span
        className={`transition-transform duration-300 ${
          isCollapsed ? "-rotate-90" : ""
        }`}
      >
        <ChevronDownIcon className="h-5 w-5 text-slate-500" />
      </span>
    </button>
  );
};

// --- MAIN PAGE COMPONENT ---

function SwitchListPage() {
  const [groupedRacks, setGroupedRacks] = useState({});
  const [unrackedSwitches, setUnrackedSwitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRackModal, setShowRackModal] = useState(false);
  const [showAddSwitchModal, setShowAddSwitchModal] = useState(false);
  const [editingSwitch, setEditingSwitch] = useState(null);

  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [collapsedSections, setCollapsedSections] = useState({});

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
      const initialCollapsedState = Object.keys(grouped).reduce(
        (acc, location) => {
          acc[location] = true;
          return acc;
        },
        {}
      );
      setCollapsedSections(initialCollapsedState);
      setUnrackedSwitches(unrackedRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSection = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleDeleteSwitch = async (switchId) => {
    if (window.confirm("Are you sure you want to delete this switch?")) {
      try {
        await api.delete(`/switches/${switchId}`);
        toast.success("Switch deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete switch.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading Infrastructure...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- [NEW DESIGN] PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <PageHeaderIcon className="h-10 w-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
              Switch Infrastructure
            </h1>
            <p className="text-slate-500">
              Manage all network racks and devices from a central view.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <GridViewIcon />
            </button>
            <button
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <ListViewIcon />
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          {/* Action Buttons */}
          <button
            onClick={() => setShowRackModal(true)}
            className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50"
          >
            Manage Racks
          </button>
          <button
            onClick={() => setShowAddSwitchModal(true)}
            className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
          >
            Add Switch
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* --- [NEW DESIGN] CONTENT AREA --- */}
      <div className="space-y-8">
        {Object.keys(groupedRacks) // 1. ดึง Key (ชื่อ Location) ออกมาเป็น Array
          .sort((a, b) => {
            // 2. จัดเรียง Key แบบ Natural Sort
            const numA = parseInt(a.match(/\d+/)?.[0] || 0); // ดึงตัวเลขจาก String a
            const numB = parseInt(b.match(/\d+/)?.[0] || 0); // ดึงตัวเลขจาก String b
            return numA - numB; // เปรียบเทียบตัวเลข
          })
          .map((location) => {
            // 3. Map ข้อมูลที่จัดเรียงแล้ว
            const racksInLocation = groupedRacks[location]; // ดึงข้อมูล racks จาก key ที่จัดเรียงแล้ว
            const isCollapsed = collapsedSections[location];
            return (
              <section
                key={location}
                className="bg-slate-50 rounded-lg border border-slate-200"
              >
                <LocationHeader
                  location={location}
                  racks={racksInLocation}
                  onToggle={() => toggleSection(location)}
                  isCollapsed={isCollapsed}
                />

                {!isCollapsed && (
                  <div className="p-4 md:p-6">
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {racksInLocation.map((rack) => (
                          <RackCard
                            key={rack.id}
                            rack={rack}
                            onEditSwitch={setEditingSwitch}
                            onDeleteSwitch={handleDeleteSwitch}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {racksInLocation.map((rack) => (
                          <RackRow
                            key={rack.id}
                            rack={rack}
                            onEditSwitch={setEditingSwitch}
                            onDeleteSwitch={handleDeleteSwitch}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

        {unrackedSwitches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">
              Unassigned Devices
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-2 space-y-1">
              {unrackedSwitches.map((sw) => (
                <SwitchListItem
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

      {/* --- MODALS (No change needed) --- */}
      {showRackModal && (
        <ManageRackModal
          onClose={() => {
            setShowRackModal(false);
            fetchData();
          }}
        />
      )}
      {showAddSwitchModal && (
        <AddSwitchModal
          onClose={() => setShowAddSwitchModal(false)}
          onSwitchAdded={fetchData}
        />
      )}
      {editingSwitch && (
        <EditSwitchModal
          sw={editingSwitch}
          onClose={() => setEditingSwitch(null)}
          onSwitchUpdated={fetchData}
        />
      )}
    </div>
  );
}

export default SwitchListPage;
