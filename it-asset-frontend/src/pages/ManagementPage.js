// src/pages/ManagementPage.js

import React, { useState, useEffect } from 'react';
// --- CHANGE 1: Import the central 'api' instance instead of 'axios' ---
import api from '../api'; // Adjust path as needed

function ManagementPage({ title, dataType }) {
  const [items, setItems] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchData = async () => {
    try {
      setLoading(true);
      // --- CHANGE 2: Use the 'api' instance for fetching data ---
      const res = await api.get(`/master-data/${dataType}`);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      // --- CHANGE 3: Use the 'api' instance for adding new data ---
      await api.post('/master-data', {
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
        // --- CHANGE 4: Use the 'api' instance for deleting data ---
        await api.delete(`/master-data/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete item', err);
        setError('Failed to delete item.');
      }
    }
  };

  // --- No changes to JSX below ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add new ${dataType}...`}
          className="flex-grow"
        />
        <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600">
          + Add
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {currentItems.map(item => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <span className="text-gray-800">{item.value}</span>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-200/50 text-sm font-semibold px-2 py-1 rounded-md transition-colors">
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, items.length)} of {items.length} entries
                </span>
                <div className="flex">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-r-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ManagementPage;