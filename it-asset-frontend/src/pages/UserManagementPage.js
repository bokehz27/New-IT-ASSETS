// src/pages/UserManagementPage.js

import React, { useState, useEffect } from 'react';
// --- CHANGE 1: Import the central 'api' instance instead of 'axios' ---
import api from '../api'; // Adjust path as needed
import EditUserModal from './EditUserModal';

// --- CHANGE 2: Remove the unnecessary API_URL constant ---
// const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function UserManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchData = async () => {
    try {
      setLoading(true);
      // --- CHANGE 3: Use the 'api' instance for fetching data ---
      // This ensures requests are authenticated.
      const [employeesRes, departmentsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/master-data/department')
      ]);
      
      setEmployees(employeesRes.data);
      setDepartmentOptions(departmentsRes.data.map(item => item.value));
      setError('');
    } catch (err) {
      setError('Failed to load initial page data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async (dataFromModal) => {
    if (!dataFromModal.fullName.trim()) {
      alert('กรุณากรอกชื่อ-สกุล');
      return;
    }

    try {
      // --- CHANGE 4: Use the 'api' instance for saving data ---
      if (editingEmployee) {
        // Edit Mode
        await api.put(`/employees/${editingEmployee.id}`, dataFromModal);
      } else {
        // Add Mode
        await api.post('/employees', dataFromModal);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(editingEmployee ? 'Failed to update employee.' : 'Failed to add employee.');
    }
  };
  
  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsEditModalOpen(true);
  };
  
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // --- CHANGE 5: Use the 'api' instance for deleting data ---
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  // --- No changes to JSX below ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">จัดการข้อมูลผู้ใช้</h2>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                    <th className="p-3 font-semibold text-gray-600">ชื่อ-สกุล</th>
                    <th className="p-3 font-semibold text-gray-600">ตำแหน่ง</th>
                    <th className="p-3 font-semibold text-gray-600">E-Mail</th>
                    <th className="p-3 font-semibold text-gray-600">เบอร์ติดต่อ</th>
                    <th className="p-3 font-semibold text-gray-600">แผนก</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading...</td></tr>
                ) : (
                    currentItems.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{emp.fullName}</td>
                            <td className="p-3 text-gray-700">{emp.position}</td>
                            <td className="p-3 text-gray-700">{emp.email}</td>
                            <td className="p-3 text-gray-700">{emp.contactNumber}</td>
                            <td className="p-3 text-gray-700">{emp.department}</td>
                            <td className="p-3 text-center">
                                <button
                                  onClick={() => handleEditClick(emp)}
                                  className="text-blue-600 hover:bg-blue-200/50 text-sm font-semibold px-2 py-1 rounded-md transition-colors mr-2"
                                >
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:bg-red-200/50 text-sm font-semibold px-2 py-1 rounded-md transition-colors">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
       </div>

       {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employees.length)} of {employees.length} entries
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

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        employee={editingEmployee}
        onSave={handleSave}
        departmentOptions={departmentOptions}
      />
    </div>
  );
}

export default UserManagementPage;