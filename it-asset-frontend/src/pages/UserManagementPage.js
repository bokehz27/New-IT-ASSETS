import React, { useState, useEffect } from 'react';
import api from '../api'; // Adjust path as needed
import EditUserModal from './EditUserModal';

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
      alert('Please enter the full name.');
      return;
    }

    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, dataFromModal);
      } else {
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
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
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
              <th className="p-3 font-semibold text-gray-600">Full Name</th>
              <th className="p-3 font-semibold text-gray-600">Position</th>
              <th className="p-3 font-semibold text-gray-600">E-Mail</th>
              <th className="p-3 font-semibold text-gray-600">Contact Number</th>
              <th className="p-3 font-semibold text-gray-600">Department</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : (
              currentItems.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{emp.fullName}</td>
                  <td className="p-3 text-gray-700">{emp.position}</td>
                  <td className="p-3 text-gray-700">{emp.email}</td>
                  <td className="p-3 text-gray-700">{emp.contactNumber}</td>
                  <td className="p-3 text-gray-700">{emp.department}</td>
                  <td className="p-3">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                        title="Edit User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
