import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import SearchableDropdown from "./SearchableDropdown"; // ปรับ path ให้ตรง

function EditSwitchModal({ sw, onClose, onSwitchUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    port_count: 0,
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

  useEffect(() => {
    if (sw) {
      setFormData({
        name: sw.name || "",
        model: sw.model || "",
        port_count: sw.port_count || 0,
        ip_address: sw.ip_address || "",
        rackId: sw.rackId || "",
      });
    }
  }, [sw]);

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
    try {
      await api.put(`/switches/${sw.id}`, formData);
      onSwitchUpdated();
      onClose();
    } catch (err) {
      setError("Failed to update switch. Please check your input.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9990]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Switch</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Switch Name"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
          <input
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
          <input
            type="number"
            name="port_count"
            value={formData.port_count}
            onChange={handleChange}
            placeholder="Number of Ports"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
            disabled
            title="Port count cannot be changed after creation."
          />
          <input
            name="ip_address"
            value={formData.ip_address}
            onChange={handleChange}
            placeholder="IP Address"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rack
            </label>
            <SearchableDropdown
              options={rackOptions}
              value={formData.rackId}
              onChange={(val) => setFormData((p) => ({ ...p, rackId: val }))}
              placeholder="--- Select a Rack ---"
              idPrefix="dd-edit-rack"
              menuZIndex={10000}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSwitchModal;
