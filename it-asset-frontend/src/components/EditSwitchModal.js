import React, { useState, useEffect } from 'react';
import api from '../api';

function EditSwitchModal({ sw, onClose, onSwitchUpdated }) {
  // 1. ปรับ formData ให้ตรงกับข้อมูลล่าสุด
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    port_count: 0,
    ip_address: '',
    rackId: '',
  });
  const [rackOptions, setRackOptions] = useState([]);
  const [error, setError] = useState('');

  // ดึงข้อมูล Rack สำหรับ Dropdown
  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const res = await api.get('/racks');
        setRackOptions(res.data);
      } catch (err) {
        console.error("Failed to fetch racks", err);
      }
    };
    fetchRacks();
  }, []);

  // อัปเดตฟอร์มเมื่อ sw prop เปลี่ยน (เมื่อ Modal ถูกเปิด)
  useEffect(() => {
    if (sw) {
      setFormData({
        name: sw.name || '',
        model: sw.model || '',
        port_count: sw.port_count || 0,
        ip_address: sw.ip_address || '',
        rackId: sw.rackId || '',
      });
    }
  }, [sw]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ใช้ PUT method เพื่ออัปเดตข้อมูล
      await api.put(`/switches/${sw.id}`, formData);
      onSwitchUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update switch. Please check your input.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Switch</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* 2. แก้ไข Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Switch Name" className="w-full" required />
          <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" className="w-full" required />
          <input type="number" name="port_count" value={formData.port_count} placeholder="Number of Ports" className="w-full" required disabled title="Port count cannot be changed after creation."/>
          <input name="ip_address" value={formData.ip_address} onChange={handleChange} placeholder="IP Address" className="w-full" />
          
          {/* 3. แก้ไข Select ให้เป็น required */}
          <select name="rackId" value={formData.rackId || ''} onChange={handleChange} className="w-full" required>
            <option value="">--- Select a Rack ---</option>
            {rackOptions.map(rack => <option key={rack.id} value={rack.id}>{rack.name}</option>)}
          </select>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSwitchModal;