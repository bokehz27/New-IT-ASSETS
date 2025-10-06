// src/components/ReplaceAssetModal.js

import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

// ✨ 1. สร้างรายการ Fields ที่สามารถย้ายได้แบบละเอียด
const transferableFields = [
    { key: 'employee_data', label: 'User Name & User ID' },
    { key: 'department_id', label: 'Department' },
    { key: 'location_id', label: 'Location' },
    { key: 'ip_assignments', label: 'Assigned IPs' },
    { key: 'office_config', label: 'Microsoft Office & Key' },
    { key: 'antivirus_program_id', label: 'Antivirus' },
    { key: 'special_programs', label: 'Special Programs' },
];

function ReplaceAssetModal({ asset, onClose, onSuccess }) {
  const [newAssetName, setNewAssetName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fieldsToTransfer, setFieldsToTransfer] = useState(
    transferableFields.reduce((acc, field) => {
      acc[field.key] = true; // ตั้งค่าเริ่มต้นให้เลือกทั้งหมด
      return acc;
    }, {})
  );

  const handleTransferChange = (e) => {
    const { name, checked } = e.target;
    setFieldsToTransfer(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (!newAssetName.trim()) {
      setError("Please enter a name for the new asset.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/assets/clone-and-replace", {
        oldAssetId: asset.id,
        newAssetName: newAssetName.trim(),
        transferOptions: fieldsToTransfer,
      });
      toast.success(`Asset successfully replaced with ${newAssetName.trim()}`);
      onSuccess(response.data.newAsset);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred during replacement.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const inputClassName = "w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
          <h2 className="text-lg font-semibold">Replace Asset</h2>
        </div>

        <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
                Old Asset: <strong className="text-slate-800">{asset.asset_name}</strong>
            </p>
            
            <div>
                <label htmlFor="new-asset-name" className="block text-sm font-medium text-slate-700 mb-1">New Asset Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="new-asset-name"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className={inputClassName}
                    placeholder="Enter the name of the new asset..."
                />
            </div>
            
            {/* ✨ 2. แสดง Checkbox แบบละเอียด */}
            <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-slate-700">Select data to MOVE to the new asset</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {transferableFields.map(field => (
                         <div key={field.key} className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input 
                                    id={`transfer-${field.key}`} 
                                    name={field.key} 
                                    type="checkbox" 
                                    checked={fieldsToTransfer[field.key]} 
                                    onChange={handleTransferChange} 
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={`transfer-${field.key}`} className="font-medium text-slate-700">{field.label}</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
        </div>

        <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-70">{submitting ? "Replacing..." : "Confirm Replacement"}</button>
        </div>
      </div>
    </div>
  );
}
export default ReplaceAssetModal;