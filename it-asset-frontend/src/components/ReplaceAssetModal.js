// src/components/ReplaceAssetModal.js
import React, { useState } from 'react';
import api from '../api';

const ReplaceAssetModal = ({ asset, onClose, onSuccess }) => {
    const [newAssetCode, setNewAssetCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // รายการข้อมูลที่จะคัดลอก
    const fieldsToCopy = {
        'ip_address': 'IP Address',
        'wifi_registered': 'Wifi Register',
        'antivirus': 'Antivirus',
        'specialPrograms': 'Special Programs',   // ✅ เพิ่มให้เลือกได้
        'user_name': 'User',
        'user_id': 'User ID',
        'department': 'Department / Division',
        'location': 'Location',
        'category': 'Category',
        'subcategory': 'Subcategory',
        'office_version': 'Microsoft Office',
        'office_key': 'Office Product Key',
    };

    const [checkedFields, setCheckedFields] = useState(
        Object.keys(fieldsToCopy).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedFields(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAssetCode.trim()) {
            setError('Please enter the new asset code.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        const selectedFields = Object.keys(checkedFields).filter(key => checkedFields[key]);

        try {
            const response = await api.post(`/assets/${asset.id}/replace`, {
                newAssetCode: newAssetCode.trim(),
                fieldsToCopy: selectedFields,
            });
            onSuccess(response.data.newAsset);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to replace asset.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    Replace Asset : <span className="text-blue-600">{asset.asset_code}</span>
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Fields to Move :
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md">
                            {Object.entries(fieldsToCopy).map(([key, label]) => (
                                <label key={key} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={checkedFields[key]}
                                        onChange={handleCheckboxChange}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-800">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="newAssetCode" className="block text-gray-700 text-sm font-bold mb-2">
                            New Asset Code :
                        </label>
                        <input
                            id="newAssetCode"
                            type="text"
                            value={newAssetCode}
                            onChange={(e) => setNewAssetCode(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Replacing...' : 'Confirm Replace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReplaceAssetModal;