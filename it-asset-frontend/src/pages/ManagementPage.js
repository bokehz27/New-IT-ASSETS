import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManagementPage({ title, dataType }) {
  const [items, setItems] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://172.18.1.61:5000/api/master-data/${dataType}`);
      setItems(res.data);
      setError('');
    } catch (err) {
      console.error(`Failed to fetch ${dataType}`, err);
      setError(`Failed to load data for ${title}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      await axios.post('http://172.18.1.61:5000/api/master-data', {
        type: dataType,
        value: newValue,
      });
      setNewValue('');
      fetchData();
    } catch (err) {
      console.error('Failed to add item', err);
      setError(err.response?.data?.error || 'Failed to add item.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://172.18.1.61:5000/api/master-data/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete item', err);
        setError('Failed to delete item.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        {/* Input: ใช้ Global Style */}
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add new ${dataType}...`}
          className="flex-grow"
        />
        {/* Button: ใช้ Primary Button Style */}
        <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600">
          Add
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li key={item.id} className="py-3 flex justify-between items-center">
              <span className="text-gray-800">{item.value}</span>
              {/* Delete Button: ใช้สี Error และปรับปรุงสไตล์ */}
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-200/50 text-sm font-semibold px-2 py-1 rounded-md transition-colors">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManagementPage;