import React, { useState, useEffect } from 'react';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
// --- [เพิ่ม] Import ไอคอนจาก React Icons ---
import { FiPlusCircle, FiUpload, FiUserPlus, FiEdit } from 'react-icons/fi';

// --- ลงทะเบียน Chart.js components ---
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


// --- [ปรับปรุง] Quick Action Button Component ---
const ActionButton = ({ to, icon, title, subtitle }) => (
  <Link to={to} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 group">
    {/* ปรับปรุงส่วนแสดงผลไอคอน */}
    <div className="bg-gray-100 p-3 rounded-lg transition-colors duration-300 group-hover:bg-blue-100">
      {/* ส่งไอคอนที่เป็น Component เข้ามาตรงนี้ */}
      {icon} 
    </div>
    <div>
      <p className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Link>
);


// --- Stat Card Component (ยังคงเดิม) ---
const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-lg shadow-sm ${color}`}>
    <p className="text-sm opacity-80">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // ตั้งค่าวันที่ปัจจุบัน
    setCurrentDate(new Date().toLocaleDateString('th-TH', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }));

    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data);
      } catch (error) {
        console.error("Failed to fetch summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !summary) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  const ticketsByStatusData = {
    labels: summary.ticketsByStatus.map(item => item.status),
    datasets: [{
      data: summary.ticketsByStatus.map(item => item.count),
      backgroundColor: ['#60A5FA', '#FBBF24', '#34D399', '#F87171', '#9CA3AF'],
      borderColor: '#FFFFFF',
      borderWidth: 2,
    }],
  };
  const doughnutOptions = {
    cutout: '60%',
    plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } } }
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">สรุปภาพรวมระบบ ณ วันที่ {currentDate}</p>
      </div>

      {/* --- [ปรับปรุง] Quick Actions ที่ใช้ React Icons --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton 
          to="/add" 
          icon={<FiPlusCircle className="w-6 h-6 text-blue-500" />} 
          title="เพิ่มสินทรัพย์ใหม่" 
          subtitle="เพิ่มอุปกรณ์ IT ชิ้นเดียว" 
        />
        <ActionButton 
          to="/admin/create-ticket" 
          icon={<FiEdit className="w-6 h-6 text-green-500" />} 
          title="สร้าง Ticket" 
          subtitle="เปิดใบแจ้งซ่อมสำหรับแอดมิน" 
        />
        <ActionButton 
          to="/import" 
          icon={<FiUpload className="w-6 h-6 text-purple-500" />} 
          title="นำเข้าข้อมูล" 
          subtitle="เพิ่มสินทรัพย์หลายชิ้นจากไฟล์" 
        />
        <ActionButton 
          to="/settings/user_name" 
          icon={<FiUserPlus className="w-6 h-6 text-yellow-500" />} 
          title="เพิ่มผู้ใช้" 
          subtitle="จัดการข้อมูลผู้ใช้งาน" 
        />
      </div>
      
      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: Stat Cards & Recent Tickets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="สินทรัพย์ทั้งหมด" value={summary.assetCount} color="bg-blue-500 text-white" />
            <Link to="/assets?filter=incomplete" className="group">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full">
                <StatCard title="สินทรัพย์ที่ข้อมูลไม่ครบ" value={summary.incompleteAssetCount} color="bg-orange-500 text-white" />
              </div>
            </Link>
            <StatCard title="งานที่กำลังดำเนินการ" value={summary.inProgressCount} color="bg-yellow-500 text-white" />
            <StatCard title="Ticket ทั้งหมด" value={summary.ticketCount} color="bg-gray-700 text-white" />
          </div>

          {/* Recent Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="font-bold text-lg mb-4">รายการแจ้งซ่อมล่าสุด</h3>
              <ul className="divide-y divide-gray-100">
                {summary.recentTickets.map(ticket => (
                  <li key={ticket.id} className="py-3">
                    <Link to={`/update-ticket/${ticket.id}`} className="text-sm group">
                      <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{ticket.problem_description}</p>
                      <p className="text-gray-500">{ticket.reporter_name} - <span className="font-semibold">{ticket.status}</span></p>
                    </Link>
                  </li>
                ))}
              </ul>
          </div>
        </div>

        {/* คอลัมน์ขวา: กราฟสรุปสถานะ */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h3 className="font-bold text-lg mb-4">สรุปสถานะรายการแจ้งซ่อม</h3>
            <div className="flex-grow flex items-center justify-center">
              <Doughnut data={ticketsByStatusData} options={doughnutOptions} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;