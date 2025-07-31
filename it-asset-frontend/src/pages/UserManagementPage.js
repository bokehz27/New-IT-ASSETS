import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function UserManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]); // State สำหรับเก็บรายชื่อแผนก
  const [formData, setFormData] = useState({
    fullName: '', position: '', email: '', contactNumber: '', department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // ดึงข้อมูลพนักงานและแผนกพร้อมกัน
        const [employeesRes, departmentsRes] = await Promise.all([
          axios.get(`${API_URL}/employees`),
          axios.get(`${API_URL}/master-data/department`)
        ]);
        
        setEmployees(employeesRes.data);
        // นำเฉพาะค่า value มาเก็บใน state
        setDepartmentOptions(departmentsRes.data.map(item => item.value));
        setError('');
      } catch (err) {
        setError('Failed to load initial page data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    try {
      await axios.post(`${API_URL}/employees`, formData);
      setFormData({ fullName: '', position: '', email: '', contactNumber: '', department: '' });
      fetchData(); // ใช้ fetchData ที่เรามีอยู่แล้วเพื่อความง่าย
    } catch (err) {
      setError('Failed to add employee.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`);
        fetchData(); // ใช้ fetchData ที่เรามีอยู่แล้วเพื่อความง่าย
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  // สร้างฟังก์ชัน fetchData แยกเพื่อให้เรียกใช้ซ้ำได้
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to refresh employee data.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">จัดการข้อมูลผู้ใช้</h2>
      
      <form onSubmit={handleSubmit} className="border-b border-gray-200 pb-6 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* --- แถวที่ 1 --- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล*</label>
      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full" placeholder="Full Name" required />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
      <input type="text" name="position" value={formData.position} onChange={handleInputChange} className="w-full" placeholder="Position" />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">หน่วยงาน/แผนก</label>
      <select
        name="department"
        value={formData.department}
        onChange={handleInputChange}
        className="w-full"
      >
        <option value="">-- เลือกแผนก --</option>
        {departmentOptions.map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
    </div>

    {/* --- แถวที่ 2 --- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full" placeholder="Email" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อ</label>
      <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full" placeholder="Contact No." />
    </div>
    
    {/* --- ปุ่ม Submit --- */}
    <div className="flex items-end">
      <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 w-full">
        Add User
      </button>
    </div>

  </div>
</form>

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
                    employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{emp.fullName}</td>
                            <td className="p-3 text-gray-700">{emp.position}</td>
                            <td className="p-3 text-gray-700">{emp.email}</td>
                            <td className="p-3 text-gray-700">{emp.contactNumber}</td>
                            <td className="p-3 text-gray-700">{emp.department}</td>
                            <td className="p-3 text-center">
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
    </div>
  );
}

export default UserManagementPage;