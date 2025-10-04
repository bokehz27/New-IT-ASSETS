// src/pages/SwitchListPage.js

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ManageRackModal from "../components/ManageRackModal";
import AddSwitchModal from "../components/AddSwitchModal";
import EditSwitchModal from "../components/EditSwitchModal";

// --- ICONS (เพิ่มไอคอนใหม่บางส่วน) ---

const RackIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const PageHeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
const GridViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const ListViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
);


// --- [REDESIGN] SUB-COMPONENTS ---

const SwitchListItem = ({ sw, onEdit, onDelete }) => (
    <div className="switch-list-item">
        <Link to={`/switches/${sw.id}`} className="flex-grow overflow-hidden pr-4">
            <p className="font-semibold text-[var(--color-text-primary)] truncate">{sw.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)] truncate">
                {sw.ip_address ? `IP: ${sw.ip_address}` : sw.model || "No model assigned"}
            </p>
        </Link>
        <div className="flex items-center space-x-2">
            <button onClick={() => onEdit(sw)} className="action-btn" title="Edit Switch">
                <EditIcon />
            </button>
            <button onClick={() => onDelete(sw.id)} className="action-btn-delete" title="Delete Switch">
                <DeleteIcon />
            </button>
        </div>
    </div>
);

const RackCard = ({ rack, onEditSwitch, onDeleteSwitch }) => (
    <div className="rack-card">
        <div className="rack-card-header">
            <RackIcon className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text-primary)] truncate">{rack.name}</h3>
        </div>
        <div className="rack-card-body">
            {rack.Switches && rack.Switches.length > 0 ? (
                rack.Switches.map((sw) => (
                    <SwitchListItem key={sw.id} sw={sw} onEdit={onEditSwitch} onDelete={onDeleteSwitch} />
                ))
            ) : (
                <div className="text-center py-8 px-4 text-sm text-[var(--color-text-secondary)]">
                    <p>No devices in this rack.</p>
                </div>
            )}
        </div>
    </div>
);

const RackRow = ({ rack, onEditSwitch, onDeleteSwitch }) => (
    <div className="rack-row">
        <div className="rack-row-header">
            <RackIcon className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text-primary)]">{rack.name}</h3>
        </div>
        <div className="rack-row-body">
             {rack.Switches && rack.Switches.length > 0 ? (
                rack.Switches.map((sw) => (
                    <SwitchListItem key={sw.id} sw={sw} onEdit={onEditSwitch} onDelete={onDeleteSwitch} />
                ))
            ) : (
                <div className="text-sm text-[var(--color-text-secondary)] italic px-4 py-2">
                    No devices in this rack.
                </div>
            )}
        </div>
    </div>
)

const LocationHeader = ({ location, racks, onToggle, isCollapsed }) => {
    const deviceCount = racks.reduce((acc, rack) => acc + (rack.Switches?.length || 0), 0);
    const rackCount = racks.length;

    return (
        <button className="location-header" onClick={onToggle}>
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{location}</h2>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                    <span className="location-stat">{rackCount} Racks</span>
                    <span className="location-stat">{deviceCount} Devices</span>
                </div>
            </div>
            <span className={`section-toggle-icon ${isCollapsed ? "collapsed" : ""}`}>
                <ChevronDownIcon />
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
  
  const [viewMode, setViewMode] = useState("grid");
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
      setUnrackedSwitches(unrackedRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
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
        fetchData(); // Refresh data after delete
      } catch (err) {
        alert("Failed to delete switch.");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* --- [REDESIGN] PAGE HEADER --- */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <PageHeaderIcon />
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Switch Infrastructure
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage all network racks and devices from a central view.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="view-toggle-group">
                <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
                    <GridViewIcon />
                </button>
                <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                    <ListViewIcon />
                </button>
            </div>
            <div className="h-8 w-px bg-[var(--color-divider)] mx-2"></div>
            <button onClick={() => setShowRackModal(true)} className="btn btn-secondary">
                Manage Racks
            </button>
            <button onClick={() => setShowAddSwitchModal(true)} className="btn btn-primary">
                Add Switch
            </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* --- [REDESIGN] CONTENT AREA --- */}
      <div className="space-y-8">
        {Object.entries(groupedRacks).map(([location, racksInLocation]) => {
          const isCollapsed = collapsedSections[location];
          return (
            <section key={location}>
              <LocationHeader 
                location={location}
                racks={racksInLocation}
                onToggle={() => toggleSection(location)}
                isCollapsed={isCollapsed}
              />

              {!isCollapsed && (
                <div className="mt-4">
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
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
              Unassigned Devices
            </h2>
            <div className="unassigned-card">
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
        <ManageRackModal onClose={() => { setShowRackModal(false); fetchData(); }} />
      )}
      {showAddSwitchModal && (
        <AddSwitchModal onClose={() => setShowAddSwitchModal(false)} onSwitchAdded={fetchData} />
      )}
      {editingSwitch && (
        <EditSwitchModal sw={editingSwitch} onClose={() => setEditingSwitch(null)} onSwitchUpdated={fetchData} />
      )}
    </div>
  );
}

export default SwitchListPage;