// src/pages/UpdateTicketPage.js

import React, { useState, useEffect } from 'react';
// --- CHANGE 1: Import the central 'api' instance instead of 'axios' ---
import api from '../api'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';

function UpdateTicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [repairType, setRepairType] = useState('');
  const [repairTypesOptions, setRepairTypesOptions] = useState([]);
  const [solution, setSolution] = useState('');
  const [status, setStatus] = useState('Open');
  const [admins, setAdmins] = useState([]);
  const [handlerName, setHandlerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // --- CHANGE 2: Fetch data in parallel for better performance ---
        // The 'api' instance handles headers automatically.
        const [ticketRes, adminsRes, repairTypesRes] = await Promise.all([
          api.get(`/tickets/${ticketId}`),
          api.get(`/users`),
          api.get(`/master-data/repair_type`)
        ]);
        
        const ticketData = ticketRes.data;
        setTicket(ticketData);
        setSolution(ticketData.solution || '');
        setStatus(ticketData.status || 'Open');
        setHandlerName(ticketData.handler_name || '');
        setProblemDescription(ticketData.problem_description || ''); 
        setRepairType(ticketData.repair_type || '');
        
        setAdmins(adminsRes.data);
        setRepairTypesOptions(repairTypesRes.data.map(item => item.value));

      } catch (error) {
        console.error("Failed to fetch data", error);
        alert('ไม่สามารถโหลดข้อมูลได้ หรือคุณไม่มีสิทธิ์');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticketId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // --- CHANGE 3: Use the 'api' instance for the update request ---
      // Manual token checking and headers are no longer needed.
      await api.put(`/tickets/${ticketId}`, { 
        solution, 
        status, 
        handler_name: handlerName,
        problem_description: problemDescription,
        repair_type: repairType
      });
      alert('อัปเดตสำเร็จ!');
      navigate('/tickets');
    } catch (error) {
      console.error("Failed to update ticket", error.response ? error.response.data : error.message);
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="text-center p-4">กำลังโหลด...</div>;
  if (!ticket) return <div className="text-center p-4 text-red-600">ไม่พบ Ticket นี้</div>;

  // --- No changes to JSX below ---
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Update Ticket #{ticket.id}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-xl mb-3 text-gray-700">รายละเอียดจากผู้แจ้ง</h3>
          <p className="mb-1"><strong>วันที่แจ้ง:</strong> {new Date(ticket.report_date).toLocaleString('th-TH')}</p>
          <p className="mb-1"><strong>ผู้แจ้ง:</strong> {ticket.reporter_name}</p>
          <p className="mb-1"><strong>เบอร์ติดต่อ:</strong> {ticket.contact_phone}</p>
          <p className="mb-1"><strong>รหัสอุปกรณ์:</strong> {ticket.asset_code}</p>
          
          <div className="mt-4">
            <label htmlFor="problemDescription" className="block mb-1 font-semibold text-gray-700">ปัญหา:</label>
            <textarea id="problemDescription" value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} rows="5" className="w-full" required></textarea>
          </div>

          {ticket.attachment_url && (
            <a href={ticket.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2 inline-block">
               ดูไฟล์แนบ
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-xl mb-3 text-gray-700">ส่วนของเจ้าหน้าที่</h3>
          
          <div>
            <label htmlFor="handlerName" className="block mb-1 font-semibold text-gray-700">ผู้ดำเนินการ</label>
            <select id="handlerName" value={handlerName} onChange={(e) => setHandlerName(e.target.value)} className="w-full">
              <option value="">-- ยังไม่ได้มอบหมาย --</option>
              {admins.map(admin => (
                <option key={admin.username} value={admin.username}>
                  {admin.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="repairType" className="block mb-1 font-semibold text-gray-700">ประเภทการซ่อม:</label>
            <select id="repairType" value={repairType} onChange={(e) => setRepairType(e.target.value)} className="w-full">
              <option value="">-- เลือกประเภทการซ่อม --</option>
              {repairTypesOptions.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="solution" className="block mb-1 font-semibold text-gray-700">สาเหตุ / วิธีแก้ปัญหา</label>
            <textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} rows="6" className="w-full"></textarea>
          </div>

          <div>
            <label htmlFor="status" className="block mb-1 font-semibold text-gray-700">สถานะ</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full">
              <option value="Wait">Wait</option>
              <option value="In Progress">In Progress</option>
              <option value="Success">Success</option>
              <option value="Cancel">Cancel</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700">
            Update Ticket
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateTicketPage;