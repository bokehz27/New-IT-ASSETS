import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

function ManageRackModal({ onClose }) {
  const [racks, setRacks] = useState([]);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [editingRack, setEditingRack] = useState(null); // State สำหรับเก็บข้อมูล Rack ที่กำลังแก้ไข
  const [loading, setLoading] = useState(true);

  const fetchRacks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/racks');
      setRacks(res.data);
    } catch (error) {
      console.error("Failed to fetch racks", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditClick = (rack) => {
    setEditingRack(rack);
    setFormData({ name: rack.name, location: rack.location || '' });
  };

  const handleCancelEdit = () => {
    setEditingRack(null);
    setFormData({ name: '', location: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingRack) {
        // --- Edit Mode ---
        await api.put(`/racks/${editingRack.id}`, formData);
      } else {
        // --- Add Mode ---
        await api.post('/racks', formData);
      }
      handleCancelEdit(); // Reset form and exit edit mode
      fetchRacks(); // Refresh the list
    } catch (error) {
      alert(`Failed to ${editingRack ? 'update' : 'add'} rack. Name might already exist.`);
      console.error(error);
    }
  };

  const handleDeleteRack = async (id) => {
    if (window.confirm('Are you sure? This will unassign all assets in this rack.')) {
      try {
        await api.delete(`/racks/${id}`);
        fetchRacks();
      } catch (error) {
        alert('Failed to delete rack.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{editingRack ? 'Edit Rack' : 'Manage Racks'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Rack Name" className="flex-grow" required />
            <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (Optional)" className="flex-grow" />
            <button type="submit" className={`text-white font-semibold py-2 px-4 rounded-md ${editingRack ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
              {editingRack ? 'Update' : 'Add'}
            </button>
            {editingRack && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                Cancel
              </button>
            )}
          </form>
          <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {loading ? <p>Loading racks...</p> : racks.map(rack => (
              <div key={rack.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{rack.name}</p>
                  {rack.location && <p className="text-gray-500 text-sm">{rack.location}</p>}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleEditClick(rack)} className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                  <button onClick={() => handleDeleteRack(rack.id)} className="text-red-600 hover:underline text-sm font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-100 p-4 flex justify-end rounded-b-lg">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
}

export default ManageRackModal;