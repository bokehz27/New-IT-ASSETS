import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

const ReportPage = () => {
    const availableFields = [
        // ... รายการฟิลด์ทั้งหมดของคุณเหมือนเดิม ...
        { key: 'asset_code', label: 'IT Asset' }, { key: 'model', label: 'Model' },
        { key: 'category', label: 'Category' }, { key: 'subcategory', label: 'Subcategory' },
        { key: 'ram', label: 'RAM' }, { key: 'cpu', label: 'CPU' },
        { key: 'storage', label: 'Storage' }, { key: 'device_id', label: 'Device' },
        { key: 'ip_address', label: 'IP Address' }, { key: 'wifi_registered', label: 'WiFi Registered' },
        { key: 'mac_address_lan', label: 'MAC Address (LAN)' }, { key: 'mac_address_wifi', label: 'MAC Address (WiFi)' },
        { key: 'serial_number', label: 'Serial Number' }, { key: 'brand', label: 'Brand' },
        { key: 'start_date', label: 'Start Date' }, { key: 'location', label: 'Location' },
        { key: 'fin_asset_ref', label: 'Fin Asset' }, { key: 'user_id', label: 'User ID' },
        { key: 'user_name', label: 'User Name' }, { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status' }, { key: 'windows_version', label: 'Windows Version' },
        { key: 'windows_key', label: 'Windows Key' }, { key: 'office_version', label: 'Office Version' },
        { key: 'office_key', label: 'Office Key' }, { key: 'antivirus', label: 'Antivirus' },
    ];

    // --- State Management ---
    const [selectedFields, setSelectedFields] = useState({});
    const [presets, setPresets] = useState([]);
    const [newPresetName, setNewPresetName] = useState('');
    const [selectedPresetName, setSelectedPresetName] = useState(''); // <-- เพิ่ม State นี้

    useEffect(() => {
        try {
            const savedPresets = localStorage.getItem('reportPresets');
            if (savedPresets) {
                setPresets(JSON.parse(savedPresets));
            }
        } catch (error) {
            console.error("Failed to load presets from localStorage", error);
        }
    }, []);

    const savePresetsToLocalStorage = (updatedPresets) => {
        try {
            localStorage.setItem('reportPresets', JSON.stringify(updatedPresets));
        } catch (error) {
            console.error("Failed to save presets to localStorage", error);
        }
    };
    
    const handleSavePreset = () => {
        if (!newPresetName.trim()) {
            alert('Please enter a name for the preset.');
            return;
        }
        if (presets.some(p => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) {
            alert('A preset with this name already exists.');
            return;
        }

        const currentSelectedKeys = Object.keys(selectedFields).filter(key => selectedFields[key]);
        if (currentSelectedKeys.length === 0) {
            alert('Please select at least one field to save in the preset.');
            return;
        }

        const newPreset = {
            name: newPresetName.trim(),
            fields: currentSelectedKeys,
        };

        const updatedPresets = [...presets, newPreset];
        setPresets(updatedPresets);
        savePresetsToLocalStorage(updatedPresets);
        setNewPresetName('');
        alert(`Preset "${newPreset.name}" saved successfully!`);
    };
    
    const handleDeletePreset = (presetNameToDelete) => {
        if (window.confirm(`Are you sure you want to delete the preset "${presetNameToDelete}"?`)) {
            // หาก preset ที่ลบคืออันที่กำลังเลือกอยู่ ให้รีเซ็ต dropdown
            if (presetNameToDelete === selectedPresetName) {
                setSelectedPresetName('');
            }
            const updatedPresets = presets.filter(p => p.name !== presetNameToDelete);
            setPresets(updatedPresets);
            savePresetsToLocalStorage(updatedPresets);
        }
    };
    
    const handlePresetChange = (event) => {
        const presetName = event.target.value;
        setSelectedPresetName(presetName); // <-- แก้ไข: อัปเดต State ที่ควบคุม Dropdown

        const selectedPreset = presets.find(p => p.name === presetName);

        const newSelectedFields = {};
        if (selectedPreset) {
            availableFields.forEach(field => {
                newSelectedFields[field.key] = selectedPreset.fields.includes(field.key);
            });
        }
        setSelectedFields(newSelectedFields);
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedFields(prev => ({ ...prev, [name]: checked }));
    };

    const handleExport = async () => {
        const fieldsToExport = Object.keys(selectedFields).filter(field => selectedFields[field]);
        if (fieldsToExport.length === 0) {
            alert('Please select at least one field to export.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports/assets/export-simple`, {
                params: { fields: fieldsToExport.join(',') },
                headers: { 'x-auth-token': token },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `assets_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data.');
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Asset Report Generator</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">1. Select Fields & Export</h2>
                <div className="mb-6">
                    <label htmlFor="preset-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Load a Saved Preset:
                    </label>
                    {/* แก้ไข: เปลี่ยน value ของ select เป็น state */}
                    <select 
                        id="preset-select" 
                        onChange={handlePresetChange} 
                        value={selectedPresetName} 
                        className="mt-1 block w-full md:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">-- Select a Preset --</option>
                        {presets.map(preset => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
                    </select>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">Or select fields manually below:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 border-t pt-4">
                    {availableFields.map((field) => (
                        <label key={field.key} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" name={field.key} checked={!!selectedFields[field.key]} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <span className="text-sm text-gray-700">{field.label}</span>
                        </label>
                    ))}
                </div>
                <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                    Export to Excel
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">2. Create a New Preset</h2>
                <p className="text-sm text-gray-600 mb-4">Select the fields you want above, then give your preset a name and save it for future use.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="flex-grow w-full">
                        <label htmlFor="new-preset-name" className="block text-sm font-medium text-gray-700">Preset Name</label>
                        <input type="text" id="new-preset-name" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., Windows & Office Info"/>
                    </div>
                    <button onClick={handleSavePreset} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto flex-shrink-0">
                        Save Current Selection
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">3. Manage Saved Presets</h2>
                {presets.length > 0 ? (
                    <ul className="space-y-3">
                        {presets.map(preset => (
                            <li key={preset.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                <span className="text-gray-800 font-medium">{preset.name}</span>
                                <button onClick={() => handleDeletePreset(preset.name)} className="text-red-500 hover:text-red-700 font-semibold text-sm">
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">You have no saved presets.</p>
                )}
            </div>

        </div>
    );
};

export default ReportPage;