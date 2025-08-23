import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditUserModal from './EditUserModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function UserManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  // เราไม่ต้องการ formData state ในหน้านี้อีกต่อไป เพราะจะจัดการใน Modal
  // const [formData, setFormData] = useState(...); <-- ลบส่วนนี้

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
        axios.get(`${API_URL}/employees`),
        axios.get(`${API_URL}/master-data/department`)
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

  // --- ฟังก์ชันใหม่สำหรับจัดการการ "เพิ่ม" และ "แก้ไข" ในที่เดียว ---
  const handleSave = async (dataFromModal) => {
    if (!dataFromModal.fullName.trim()) {
      alert('กรุณากรอกชื่อ-สกุล');
      return;
    }

    try {
      if (editingEmployee) {
        // --- โหมดแก้ไข (Edit Mode) ---
        await axios.put(`${API_URL}/employees/${editingEmployee.id}`, dataFromModal);
      } else {
        // --- โหมดเพิ่ม (Add Mode) ---
        await axios.post(`${API_URL}/employees`, dataFromModal);
      }
      handleCloseModal();
      fetchData(); // โหลดข้อมูลใหม่
    } catch (err) {
      setError(editingEmployee ? 'Failed to update employee.' : 'Failed to add employee.');
    }
  };
  
  // --- ฟังก์ชันสำหรับเปิด Modal ในโหมด "เพิ่ม" ---
  const handleAddClick = () => {
    setEditingEmployee(null); // ตั้งค่าเป็น null เพื่อให้ Modal รู้ว่าเป็นโหมด "เพิ่ม"
    setIsEditModalOpen(true);
  };
  
  // --- ฟังก์ชันสำหรับเปิด Modal ในโหมด "แก้ไข" ---
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">จัดการข้อมูลผู้ใช้</h2>
        {/* **เพิ่มปุ่มสำหรับเปิด Modal การเพิ่มข้อมูล** */}
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {/* --- ส่วนฟอร์มเดิมถูกลบออกไปทั้งหมด --- */}

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {/* --- ส่วนตารางและ Pagination ยังคงเหมือนเดิม --- */}
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

      {/* **เปลี่ยน onSave ให้เรียกใช้ handleSave** */}
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