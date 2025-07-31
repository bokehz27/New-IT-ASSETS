import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- 1. เพิ่ม State สำหรับเก็บค่า Filters ---
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/tickets`, {
          headers: { 'x-auth-token': token || '' },
          // --- 2. ส่งค่า Filters ทั้งหมดไปกับ Request ---
          params: filters 
        });
        setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets", err.response ? err.response.data : err.message);
        setError("ไม่สามารถโหลดรายการแจ้งซ่อมได้");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [filters]); // --- 3. ให้ useEffect ทำงานใหม่ทุกครั้งที่ค่า filters เปลี่ยน ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-yellow-200 text-yellow-600';
      case 'Success': return 'bg-green-200 text-green-600';
      case 'Wait': return 'bg-sky-200 text-sky-600';
      case 'Cancel': return 'bg-red-200 text-red-600';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const handleUpdateClick = (ticketId) => {
    navigate(`/update-ticket/${ticketId}`);
  };

  const handleDeleteClick = async (ticketId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการแจ้งซ่อมนี้?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/tickets/${ticketId}`, {
          headers: { 'x-auth-token': token }
        });
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        alert('ลบรายการแจ้งซ่อมสำเร็จ!');
      } catch (err) {
        console.error("Failed to delete ticket:", err.response ? err.response.data : err.message);
        alert('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleAddTicketClick = () => {
    navigate('/admin/create-ticket');
  };

  if (loading) return <div className="text-center p-4">กำลังโหลดรายการแจ้งซ่อม...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">รายการแจ้งซ่อมทั้งหมด</h2>
        <button
          onClick={handleAddTicketClick}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
        >
          เพิ่มแจ้งซ่อมใหม่
        </button>
      </div>

      {/* --- 4. ส่วนของ Filter UI --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามสถานะ</label>
          <select 
            name="status"
            value={filters.status} 
            onChange={handleFilterChange}
            className="w-full"
          >
            <option value="">All Statuses</option>
            <option value="Wait">Wait</option>
            <option value="In Progress">In Progress</option>
            <option value="Success">Success</option>
            <option value="Cancel">Cancel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
          <input 
            type="date" 
            name="startDate"
            value={filters.startDate} 
            onChange={handleFilterChange}
            className="w-full" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
          <input 
            type="date" 
            name="endDate"
            value={filters.endDate} 
            onChange={handleFilterChange}
            className="w-full"
          />
        </div>
      </div>
      {/* --- สิ้นสุดส่วน Filter UI --- */}

      {tickets.length === 0 ? (
        <p className="text-gray-600 text-center py-10">ไม่พบรายการแจ้งซ่อมตามเงื่อนไขที่เลือก</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-gray-600">วันที่แจ้ง</th>
                <th className="p-3 font-semibold text-gray-600">ผู้แจ้ง</th>
                <th className="p-3 font-semibold text-gray-600">รหัสอุปกรณ์</th>
                <th className="p-3 font-semibold text-gray-600">ปัญหา</th>
                <th className="p-3 font-semibold text-gray-600">วิธีแก้ปัญหา</th>
                <th className="p-3 font-semibold text-gray-600">ผู้ดำเนินการ</th>
                <th className="p-3 font-semibold text-gray-600">สถานะ</th>
                <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    {new Date(ticket.report_date).toLocaleDateString('th-TH', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 text-gray-700">{ticket.reporter_name}</td>
                  <td className="p-3 font-medium text-gray-800">{ticket.asset_code}</td>
                  <td className="p-3 text-gray-700 max-w-[200px] whitespace-normal break-words">
                    {ticket.problem_description}
                  </td>
                  <td className="p-3 text-gray-700 max-w-[200px] whitespace-normal break-words">
                    {ticket.solution || 'ยังไม่มี'}
                  </td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">{ticket.handler_name || 'ยังไม่มี'}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2 text-center align-middle whitespace-nowrap">
                    <button
                      onClick={() => handleUpdateClick(ticket.id)}
                      className="bg-blue-500 hover:bg-blue-600 table-action-button"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ticket.id)}
                      className="bg-red-500 hover:bg-red-600 table-action-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TicketListPage;