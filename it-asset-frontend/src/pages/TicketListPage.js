import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal'; // 1. Import Modal

// 2. Import ฟอร์มที่เราจะสร้างใหม่ (ตรวจสอบ Path ให้ถูกต้อง)
import TicketFormModal from '../components/TicketFormModal'; 

import {
    FaPlus, FaFilter, FaBroom, FaEdit, FaTrashAlt,
    FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

// 3. ตั้งค่า Modal Root Element (สำคัญมาก)
Modal.setAppElement('#root');

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'In Progress': return <FaSpinner className="animate-spin text-blue-500" />;
        case 'Success': return <FaCheckCircle className="text-green-500" />;
        case 'Wait': return <FaClock className="text-yellow-500" />;
        case 'Cancel': return <FaTimesCircle className="text-red-500" />;
        default: return <FaExclamationTriangle className="text-gray-500" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'status-badge-in-progress';
      case 'Success': return 'status-badge-success';
      case 'Wait': return 'status-badge-wait';
      case 'Cancel': return 'status-badge-cancel';
      default: return 'bg-gray-200 text-gray-600';
    }
};

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
  status: '',
  startDate: '',
  endDate: ''
});

  // --- 4. เพิ่ม State สำหรับ Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null); // สำหรับเก็บ ID ที่จะแก้ไข
  const [modalMode, setModalMode] = useState('create'); // 'create' หรือ 'update'

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tickets`, {
        headers: { 'x-auth-token': token || '' },
        params: {
          ...filters,
          page: currentPage,
          limit: limit
        }
      });
      
      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      setTotalItems(res.data.totalItems || 0);

    } catch (err) {
      console.error("Failed to fetch tickets", err.response ? err.response.data : err.message);
      setError("ไม่สามารถโหลดรายการแจ้งซ่อมได้");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);


  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };
  
  // --- 5. สร้างฟังก์ชันสำหรับเปิด-ปิด Modal ---
  const openModal = (mode, ticketId = null) => {
    setModalMode(mode);
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };
  
  // --- 6. ฟังก์ชัน Callback เมื่อฟอร์มใน Modal ทำงานสำเร็จ ---
  const handleFormSuccess = () => {
    closeModal();
    fetchTickets(); // โหลดข้อมูลใหม่หลังจากสร้าง/แก้ไขสำเร็จ
  };


  const handleDeleteClick = async (ticketId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการแจ้งซ่อมนี้?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/tickets/${ticketId}`, {
          headers: { 'x-auth-token': token }
        });
        
        fetchTickets();
        alert('ลบรายการแจ้งซ่อมสำเร็จ!');
      } catch (err) {
        console.error("Failed to delete ticket:", err.response ? err.response.data : err.message);
        alert('เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">รายการแจ้งซ่อม</h2>
        {/* --- 7. แก้ไขปุ่มให้เรียกฟังก์ชันเปิด Modal --- */}
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          <span>สร้างใบแจ้งซ่อม</span>
        </button>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex flex-wrap items-end gap-4">
            <div className="flex-grow" style={{ minWidth: '180px' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaFilter className="inline-block mr-2" />สถานะ
                </label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full">
                    <option value="">ทั้งหมด</option>
                    <option value="Wait">Wait</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Success">Success</option>
                    <option value="Cancel">Cancel</option>
                </select>
            </div>
            <div className="flex-grow" style={{ minWidth: '150px' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full" />
            </div>
            <div className="flex-grow" style={{ minWidth: '150px' }}>
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

      {loading ? (
        <div className="text-center p-16 text-gray-500 text-xl">กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="text-center p-16 text-red-600">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold">ไม่พบรายการแจ้งซ่อม</h3>
            <p className="mt-2">ลองเปลี่ยนเงื่อนไขการกรอง หรืออาจยังไม่มีข้อมูลในระบบ</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-blue-600">
                <tr>
                  <th className="p-3 font-semibold text-white">วันที่แจ้ง</th>
                  <th className="p-3 font-semibold text-white">รหัสอุปกรณ์</th>
                  <th className="p-3 font-semibold text-white">ชื่อผู้แจ้ง</th>
                  <th className="p-3 font-semibold text-white w-1/4">ปัญหา</th>
                  <th className="p-3 font-semibold text-white w-1/4">สาเหตุและวิธีแก้ปัญหา</th>
                  <th className="p-3 font-semibold text-white">ผู้ดำเนินการ</th>
                  <th className="p-3 font-semibold text-white">สถานะ</th>
                  <th className="p-3 font-semibold text-white text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 align-middle text-gray-800 whitespace-nowrap">
                      {new Date(ticket.report_date).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 align-middle text-gray-800">{ticket.asset_code}</td>
                    <td className="p-3 align-middle text-gray-800">{ticket.reporter_name}</td>
                    <td className="p-3 align-middle font-medium text-gray-900 break-words">{ticket.problem_description}</td>
                    <td className="p-3 align-middle text-gray-800 break-words">{ticket.solution || 'ยังไม่มี'}</td>
                    <td className="p-3 align-middle text-gray-800">{ticket.handler_name || 'ยังไม่มี'}</td>
                    <td className="p-3 align-middle">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        <StatusIcon status={ticket.status} />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        {/* --- 8. แก้ไขปุ่มให้เรียกฟังก์ชันเปิด Modal --- */}
                        <button 
                            onClick={() => openModal('update', ticket.id)} 
                            className="bg-blue-500 hover:bg-blue-600 table-action-button"
                            title="Update"
                        >
                          <FaEdit />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(ticket.id)} 
                            className="bg-red-500 hover:bg-red-600 table-action-button"
                            title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select value={limit} onChange={handleLimitChange}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({totalItems} items)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* --- 9. เพิ่ม Component Modal เข้ามาในหน้า --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Ticket Form Modal"
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <button onClick={closeModal} className="modal-close-button">&times;</button>
        <TicketFormModal 
          mode={modalMode} 
          ticketId={selectedTicketId} 
          onSuccess={handleFormSuccess} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default TicketListPage;