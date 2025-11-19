// src/pages/ReportPage.js
import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import SearchableDropdown from "../components/SearchableDropdown";

const ReportPage = () => {
  // --- State for active tab ---
  const [activeTab, setActiveTab] = useState("general"); // 'general' or 'version'

  // --- States from your original file (with PA/PRT added) ---
  const [availableFields, setAvailableFields] = useState([
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
    // ✅ ใหม่: Maintenance fields
    { key: "maintenance_start_date", label: "Maintenance Start Date" },
    { key: "maintenance_end_date", label: "Maintenance End Date" },
    { key: "maintenance_price", label: "Maintenance Price" },
    // ✅ เพิ่มฟิลด์ใหม่สำหรับ General Export
    { key: "pa", label: "PA" },
    { key: "prt", label: "PRT" },

    { key: "export_special_programs", label: "Special Programs (Sheet)" },
    { key: "export_bitlocker_keys", label: "BitLocker Keys (Sheet)" },
  ]);
  const [selectedFields, setSelectedFields] = useState({});
  const [presets, setPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [selectedPresetName, setSelectedPresetName] = useState("");

  // --- Version report states
  const [reportType, setReportType] = useState("windows");
  const [windowsVersions, setWindowsVersions] = useState([]);
  const [officeVersions, setOfficeVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  // ✅ เพิ่ม checkbox สำหรับ include PA/PRT ใน Version Report
  const [includePA, setIncludePA] = useState(false);
  const [includePRT, setIncludePRT] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Load presets
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

  // --- Load versions for the Version Report tab
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const [winRes, officeRes] = await Promise.all([
          api.get("/assets/meta/windows-versions"),
          api.get("/assets/meta/office-versions"),
        ]);
        setWindowsVersions(
          winRes.data.map((v) => ({ label: v.name, value: v.id }))
        );
        setOfficeVersions(
          officeRes.data.map((v) => ({ label: v.name, value: v.id }))
        );
      } catch (error) {
        console.error("Failed to fetch software versions", error);
        alert("Could not load Windows/Office version lists.");
      }
    };
    fetchVersions();
  }, []);

  const presetOptions = useMemo(
    () => presets.map((p) => ({ label: p.name, value: p.name })),
    [presets]
  );

  const savePresetsToLocalStorage = (updatedPresets) => {
    localStorage.setItem("reportPresets", JSON.stringify(updatedPresets));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      alert("Please enter a name for the preset.");
      return;
    }
    if (
      presets.some(
        (p) => p.name.toLowerCase() === newPresetName.trim().toLowerCase()
      )
    ) {
      alert("A preset with this name already exists.");
      return;
    }
    const currentSelectedKeys = Object.keys(selectedFields).filter(
      (key) => selectedFields[key]
    );
    if (currentSelectedKeys.length === 0) {
      alert("Please select at least one field to save in the preset.");
      return;
    }
    const newPreset = {
      name: newPresetName.trim(),
      fields: currentSelectedKeys,
    };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToLocalStorage(updatedPresets);
    setNewPresetName("");
    alert(`Preset "${newPreset.name}" saved successfully!`);
  };

  const handleDeletePreset = (presetNameToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete the preset "${presetNameToDelete}"?`
      )
    ) {
      if (presetNameToDelete === selectedPresetName) {
        setSelectedPresetName("");
        const newSelectedFields = {};
        availableFields.forEach((field) => {
          newSelectedFields[field.key] = false;
        });
        setSelectedFields(newSelectedFields);
      }
      const updatedPresets = presets.filter(
        (p) => p.name !== presetNameToDelete
      );
      setPresets(updatedPresets);
      savePresetsToLocalStorage(updatedPresets);
    }
  };

  const handlePresetChange = (presetName) => {
    setSelectedPresetName(presetName);
    const selectedPreset = presets.find((p) => p.name === presetName);
    const newSelectedFields = {};
    availableFields.forEach((field) => {
      newSelectedFields[field.key] = selectedPreset
        ? selectedPreset.fields.includes(field.key)
        : false;
    });
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
      link.setAttribute(
        "download",
        `assets_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };

  const versionOptions = useMemo(() => {
    return reportType === "windows" ? windowsVersions : officeVersions;
  }, [reportType, windowsVersions, officeVersions]);

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setSelectedVersionId(null);
  };

  const handleGenerateVersionReport = async () => {
    if (!selectedVersionId) {
      alert(`Please select a ${reportType} version to generate the report.`);
      return;
    }
    setIsGenerating(true);
    try {
      const response = await api.get("/assets/reports/by-version", {
        params: {
          type: reportType,
          versionId: selectedVersionId,
          // ✅ ส่ง flags สำหรับคอลัมน์ PA/PRT ใน Version Report
          include_pa: includePA,
          include_prt: includePRT,
        },
        responseType: "blob",
      });
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${reportType}_report.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length === 2)
          filename = filenameMatch[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating version report:", error);
      alert("Failed to generate version report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
        Report Generator
      </h1>

      {/* --- Tab Navigation UI --- */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${
            activeTab === "general"
              ? "bg-white border-slate-200 border-l border-t border-r -mb-px"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          General Asset Report
        </button>
        <button
          onClick={() => setActiveTab("version")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${
            activeTab === "version"
              ? "bg-white border-slate-200 border-l border-t border-r -mb-px"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          License & Version Report
        </button>
      </div>

      {/* --- Tab Content --- */}
      <div>
        {/* General Asset Report Tab */}
        {activeTab === "general" && (
          <div className="bg-white p-6 rounded-b-xl rounded-r-xl border border-slate-200 shadow-sm">
            {/* Field Selection Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Select Fields & Export
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {availableFields.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={field.key}
                      checked={!!selectedFields[field.key]}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      {field.label}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleExport}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:opacity-90 transition"
              >
                Export to Excel
              </button>
            </div>

            <hr className="my-8" />

            {/* Preset Management */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Manage Presets
              </h2>
              <div className="mb-6">
                <label
                  htmlFor="preset-select"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Load Preset:
                </label>
                <SearchableDropdown
                  idPrefix="preset-select"
                  options={presetOptions}
                  value={selectedPresetName}
                  onChange={handlePresetChange}
                  placeholder="-- Select or Search a Preset --"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
                <div className="flex-grow w-full">
                  <label
                    htmlFor="new-preset-name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Save Current Selection as New Preset:
                  </label>
                  <input
                    type="text"
                    id="new-preset-name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="mt-1 w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm"
                    placeholder="e.g., Windows & Office Info"
                  />
                </div>
                <button
                  onClick={handleSavePreset}
                  className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white font-bold py-2 px-4 rounded-lg shadow hover:opacity-90 w-full sm:w-auto flex-shrink-0"
                >
                  Save Preset
                </button>
              </div>

              {presets.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-slate-700 mb-2">
                    Saved Presets:
                  </h3>
                  <ul className="space-y-3">
                    {presets.map((preset) => (
                      <li
                        key={preset.name}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200"
                      >
                        <span className="text-slate-800 font-medium">
                          {preset.name}
                        </span>
                        <button
                          onClick={() => handleDeletePreset(preset.name)}
                          className="text-red-500 hover:text-red-700 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* License & Version Report Tab */}
        {activeTab === "version" && (
          <div className="bg-white p-6 rounded-b-xl rounded-r-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              License & Version Report
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Generate a report of all assets using a specific version of
              Windows or Office.
            </p>

            <div className="flex items-center space-x-6 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="windows"
                  checked={reportType === "windows"}
                  onChange={handleReportTypeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Windows Report
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="office"
                  checked={reportType === "office"}
                  onChange={handleReportTypeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Office Report
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-grow w-full">
                <label
                  htmlFor="version-select"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Select {reportType === "windows" ? "Windows" : "Office"}{" "}
                  Version:
                </label>
                <SearchableDropdown
                  idPrefix="version-select"
                  options={versionOptions}
                  value={selectedVersionId}
                  onChange={(val) => setSelectedVersionId(val)}
                  placeholder={`-- Select or Search a ${reportType} Version --`}
                />
              </div>

              <button
                onClick={handleGenerateVersionReport}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:opacity-90 transition w-full sm:w-auto flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
