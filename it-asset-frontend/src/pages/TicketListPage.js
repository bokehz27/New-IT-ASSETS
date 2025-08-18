import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ไอคอนจาก React-Icons (แนะนำให้ติดตั้ง: npm install react-icons)
import { 
    FaPlus, FaFilter, FaBroom, FaEdit, FaTrashAlt,
    FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

// --- (Component ใหม่) ไอคอนสำหรับสถานะ ---
const StatusIcon = ({ status }) => {
    switch (status) {
        case 'In Progress': return <FaSpinner className="animate-spin" />;
        case 'Success': return <FaCheckCircle />;
        case 'Wait': return <FaClock />;
        case 'Cancel': return <FaTimesCircle />;
        default: return <FaExclamationTriangle />;
    }
};

// --- (Component ใหม่) สีสำหรับ Status Badge ---
const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'status-badge-in-progress';
      case 'Success': return 'status-badge-success';
      case 'Wait': return 'status-badge-wait';
      case 'Cancel': return 'status-badge-cancel';
      default: return 'bg-gray-200 text-gray-600';
    }
};

// --- (Component ใหม่) สีสำหรับขอบการ์ด ---
const getStatusBorder = (status) => {
    switch (status) {
      case 'In Progress': return 'status-in-progress';
      case 'Success': return 'status-success';
      case 'Wait': return 'status-wait';
      case 'Cancel': return 'status-cancel';
      default: return '';
    }
}


function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  const handleClearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' });
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
  
  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">รายการแจ้งซ่อม</h2>
        <button
          onClick={handleAddTicketClick}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          <span>สร้างใบแจ้งซ่อม</span>
        </button>
      </div>

      {/* --- Filter Section --- */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
         <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
            <FaFilter />
            <span>ตัวกรอง</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full">
                <option value="">ทั้งหมด</option>
                <option value="Wait">Wait</option>
                <option value="In Progress">In Progress</option>
                <option value="Success">Success</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full" />
            </div>
            <div>
                <button
                    onClick={handleClearFilters}
                    className="w-full bg-white text-gray-700 font-semibold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                    <FaBroom />
                    <span>ล้างค่า</span>
                </button>
            </div>
        </div>
      </div>

      {/* --- Content Display --- */}
      {loading ? (
        <div className="text-center p-16 text-gray-500 text-xl">กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="text-center p-16 text-red-600">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold">ไม่พบรายการแจ้งซ่อม</h3>
            <p className="mt-2">ลองเปลี่ยนเงื่อนไขการกรอง หรือกด "ล้างค่า" เพื่อแสดงทั้งหมด</p>
        </div>
      ) : (
        <div>
          {/* --- Ticket Card List --- */}
          {tickets.map(ticket => (
            <div key={ticket.id} className={`ticket-card ${getStatusBorder(ticket.status)}`}>
                <div className="ticket-card-header">
                    <h3 className="ticket-card-title">{ticket.problem_description}</h3>
                    <span className={`ticket-status-badge ${getStatusColor(ticket.status)}`}>
                        <StatusIcon status={ticket.status} />
                        {ticket.status}
                    </span>
                </div>
                
                <div className="ticket-card-body">
                    <p className="mb-2"><strong>รหัสอุปกรณ์:</strong> {ticket.asset_code}</p>
                    <p><strong>วิธีแก้ปัญหา:</strong> {ticket.solution || 'ยังไม่ระบุ'}</p>
                </div>

                <div className="ticket-card-footer">
                    <div className="ticket-card-reporter">
                        <div className="font-medium text-gray-800">{ticket.reporter_name}</div>
                        <div className="text-xs text-gray-600">
                           แจ้งเมื่อ: {new Date(ticket.report_date).toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </div>
                         <div className="text-xs text-gray-600 mt-1">
                            ผู้ดำเนินการ: {ticket.handler_name || 'ยังไม่มี'}
                        </div>
                    </div>
                    <div className="ticket-card-actions">
                         <button
                            onClick={() => handleUpdateClick(ticket.id)}
                            className="action-btn update"
                            title="Update Ticket"
                        >
                            <FaEdit />
                            <span>Update</span>
                        </button>
                        <button
                            onClick={() => handleDeleteClick(ticket.id)}
                            className="action-btn delete"
                            title="Delete Ticket"
                        >
                            <FaTrashAlt />
                           <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketListPage;