// src/pages/ReportPage.js

import React, { useState, useEffect, useMemo } from "react";
import api from "../api"; // Adjust path as needed
import SearchableDropdown from "../components/SearchableDropdown"; // ✨ 1. Import SearchableDropdown

const ReportPage = () => {
  const availableFields = [
    { key: "asset_name", label: "IT Asset" },
    { key: "serial_number", label: "Serial Number" },
    { key: "model", label: "Model" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Subcategory" },
    { key: "brand", label: "Brand" },
    { key: "ram", label: "RAM" },
    { key: "cpu", label: "CPU" },
    { key: "storage", label: "Storage" },
    { key: "device_id", label: "Device ID" },
    { key: "mac_address_lan", label: "MAC Address (LAN)" },
    { key: "mac_address_wifi", label: "MAC Address (WiFi)" },
    { key: "wifi_status", label: "WiFi Status" },
    { key: "start_date", label: "Start Date" },
    { key: "location", label: "Location" },
    { key: "fin_asset_ref_no", label: "Fin Asset Ref No." },
    { key: "user_id", label: "User ID" },
    { key: "user_name", label: "User Name" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status" },
    { key: "ip_address", label: "IP Address" },
    { key: "windows_version", label: "Windows Version" },
    { key: "windows_product_key", label: "Windows Key" },
    { key: "office_version", label: "Office Version" },
    { key: "office_product_key", label: "Office Key" },
    { key: "antivirus", label: "Antivirus" },
    { key: "remark", label: "Remark" },
    { key: "export_special_programs", label: "Special Programs (Sheet)" },
    { key: "export_bitlocker_keys", label: "BitLocker Keys (Sheet)" },
  ];

  const [selectedFields, setSelectedFields] = useState({});
  const [presets, setPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [selectedPresetName, setSelectedPresetName] = useState("");

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem("reportPresets");
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage", error);
    }
  }, []);
  
  // ✨ 2. เตรียมข้อมูล Options สำหรับ SearchableDropdown
  const presetOptions = useMemo(() => 
    presets.map(p => ({ label: p.name, value: p.name })),
  [presets]);

  const savePresetsToLocalStorage = (updatedPresets) => {
    try {
      localStorage.setItem("reportPresets", JSON.stringify(updatedPresets));
    } catch (error) {
      console.error("Failed to save presets to localStorage", error);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      alert("Please enter a name for the preset.");
      return;
    }
    if (presets.some((p) => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) {
      alert("A preset with this name already exists.");
      return;
    }
    const currentSelectedKeys = Object.keys(selectedFields).filter((key) => selectedFields[key]);
    if (currentSelectedKeys.length === 0) {
      alert("Please select at least one field to save in the preset.");
      return;
    }
    const newPreset = { name: newPresetName.trim(), fields: currentSelectedKeys };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToLocalStorage(updatedPresets);
    setNewPresetName("");
    alert(`Preset "${newPreset.name}" saved successfully!`);
  };

  const handleDeletePreset = (presetNameToDelete) => {
    if (window.confirm(`Are you sure you want to delete the preset "${presetNameToDelete}"?`)) {
      if (presetNameToDelete === selectedPresetName) {
        setSelectedPresetName("");
      }
      const updatedPresets = presets.filter((p) => p.name !== presetNameToDelete);
      setPresets(updatedPresets);
      savePresetsToLocalStorage(updatedPresets);
    }
  };

  // ✨ 3. แก้ไขฟังก์ชัน handlePresetChange ให้รับค่า value โดยตรง
  const handlePresetChange = (presetName) => {
    setSelectedPresetName(presetName);
    const selectedPreset = presets.find((p) => p.name === presetName);
    const newSelectedFields = {};
    if (selectedPreset) {
      availableFields.forEach((field) => {
        newSelectedFields[field.key] = selectedPreset.fields.includes(field.key);
      });
    }
    setSelectedFields(newSelectedFields);
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedFields((prev) => ({ ...prev, [name]: checked }));
  };

  const handleExport = async () => {
    const mainFieldsToExport = Object.keys(selectedFields).filter(
      (field) => selectedFields[field] && !field.startsWith("export_")
    );
    const exportSpecial = !!selectedFields["export_special_programs"];
    const exportBitlocker = !!selectedFields["export_bitlocker_keys"];

    if (mainFieldsToExport.length === 0 && !exportSpecial && !exportBitlocker) {
      alert("Please select at least one field or data type to export.");
      return;
    }

    try {
      const response = await api.get("/assets/reports/assets/export-simple", {
        params: {
          fields: mainFieldsToExport.join(","),
          export_special_programs: exportSpecial,
          export_bitlocker_keys: exportBitlocker,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assets_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
        Asset Report Generator
      </h1>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Select Fields & Export</h2>
        <div className="mb-6">
          <label htmlFor="preset-select" className="block text-sm font-medium text-slate-700 mb-1">
            Load a Saved Preset:
          </label>
          {/* ✨ 4. เปลี่ยนจาก <select> มาเป็น <SearchableDropdown> */}
          <div className="mt-1 block w-full md:w-1/2">
            <SearchableDropdown
              idPrefix="preset-select"
              options={presetOptions}
              value={selectedPresetName}
              onChange={handlePresetChange}
              placeholder="-- Select or Search a Preset --"
            />
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">Or select fields manually below:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 border-t border-slate-200 pt-4">
          {availableFields.map((field) => (
            <label key={field.key} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name={field.key} checked={!!selectedFields[field.key]} onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{field.label}</span>
            </label>
          ))}
        </div>
        <button onClick={handleExport} className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:opacity-90 transition">
          Export to Excel
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Create a New Preset</h2>
        <p className="text-sm text-slate-600 mb-4">Select the fields you want above, then give your preset a name and save it for future use.</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-grow w-full">
            <label htmlFor="new-preset-name" className="block text-sm font-medium text-slate-700">Preset Name</label>
            <input type="text" id="new-preset-name" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm"
              placeholder="e.g., Windows & Office Info"
            />
          </div>
          <button onClick={handleSavePreset} className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white font-bold py-2 px-4 rounded-lg shadow hover:opacity-90 w-full sm:w-auto flex-shrink-0">
            Save Current Selection
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">3. Manage Saved Presets</h2>
        {presets.length > 0 ? (
          <ul className="space-y-3">
            {presets.map((preset) => (
              <li key={preset.name} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
                <span className="text-slate-800 font-medium">{preset.name}</span>
                <button onClick={() => handleDeletePreset(preset.name)} className="text-red-500 hover:text-red-700 font-semibold text-sm">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">You have no saved presets.</p>
        )}
      </div>
    </div>
  );
};

export default ReportPage;