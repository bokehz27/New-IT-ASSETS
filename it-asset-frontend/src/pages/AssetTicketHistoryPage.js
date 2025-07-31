import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function AssetTicketHistoryPage() {
  const { assetCode } = useParams(); // ดึงรหัสอุปกรณ์จาก URL
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // เรียก API ใหม่ที่เราสร้างขึ้น
        const res = await axios.get(`http://172.18.1.61:5000/api/tickets/asset/${assetCode}`);
        setTickets(res.data);
      } catch (error) {
        console.error("Failed to fetch ticket history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [assetCode]);

  if (loading) return <div className="text-center p-10">Loading history...</div>;

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-700">ประวัติการแจ้งซ่อม</h2>
      <p className="mb-6 text-gray-500">
        สำหรับรหัสอุปกรณ์: <span className="font-semibold text-gray-800">{assetCode}</span>
      </p>
      
      {tickets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">วันที่แจ้ง</th>
                <th className="p-3">ผู้แจ้ง</th>
                <th className="p-3">ปัญหา</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3">ผู้ดำเนินการ</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="p-3">{new Date(ticket.report_date).toLocaleString('th-TH')}</td>
                  <td className="p-3">{ticket.reporter_name}</td>
                  <td className="p-3 truncate max-w-xs">{ticket.problem_description}</td>
                  <td className="p-3">{ticket.status}</td>
                  <td className="p-3">{ticket.handler_name || 'N/A'}</td>
                  <td className="p-3">
                    <Link to={`/update-ticket/${ticket.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">ไม่พบประวัติการแจ้งซ่อมสำหรับอุปกรณ์นี้</p>
      )}
    </div>
  );
}

export default AssetTicketHistoryPage;
