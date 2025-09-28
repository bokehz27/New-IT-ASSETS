// src/components/MasterDataManagement.js
import { useState, useEffect } from 'react'; // ✨ แก้ไข: ลบ 'React, ' ออก
import axios from '../api';
import { toast } from 'react-toastify';

const MasterDataManagement = ({ apiEndpoint, title, dataColumns }) => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    try {
      const response = await axios.get(`/${apiEndpoint}`);
      setData(response.data);
    } catch (error) {
      toast.error(`Failed to fetch ${title}.`);
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchData();
  }, [apiEndpoint]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await axios.put(`/${apiEndpoint}/${currentItem.id}`, formData);
        toast.success(`${title} updated successfully!`);
      } else {
        await axios.post(`/${apiEndpoint}`, formData);
        toast.success(`${title} added successfully!`);
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(`Failed to save ${title}.`);
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/${apiEndpoint}/${id}`);
        toast.success(`${title} deleted successfully!`);
        fetchData();
      } catch (error) {
        toast.error(`Failed to delete ${title}.`);
        console.error(error);
      }
    }
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    const initialFormData = dataColumns.reduce((acc, col) => {
      acc[col.key] = item && item[col.key] ? item[col.key] : '';
      return acc;
    }, {});
    setFormData(item ? { ...initialFormData, ...item } : initialFormData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{`Manage ${title}`}</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              {dataColumns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.name}</th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                 {dataColumns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">{item[col.key]}</td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{currentItem ? `Edit ${title}` : `Add New ${title}`}</h2>
            <form onSubmit={handleSubmit}>
              {dataColumns.map((col) => (
                <div className="mb-4" key={col.key}>
                  <label className="block text-gray-700 text-sm font-bold mb-2">{col.name}</label>
                  <input
                    type="text"
                    name={col.key}
                    value={formData[col.key] || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end mt-6">
                <button type="button" onClick={closeModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;