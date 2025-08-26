import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { FiPlusCircle, FiUpload, FiUserPlus, FiEdit } from "react-icons/fi";

import Modal from "react-modal";
import TicketFormModal from "../components/TicketFormModal";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

Modal.setAppElement("#root");

// ActionButton component will now handle both links and buttons
const ActionButton = ({ to, onClick, icon, title, subtitle }) => {
  const commonProps = {
    className: "bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 group cursor-pointer"
  };

  const content = (
    <>
      <div className="bg-gray-100 p-3 rounded-lg transition-colors duration-300 group-hover:bg-blue-100">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
          {title}
        </p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </>
  );

  if (to) {
    return <Link to={to} {...commonProps}>{content}</Link>;
  }

  return <div onClick={onClick} {...commonProps}>{content}</div>;
};


const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-lg shadow-sm ${color}`}>
    <p className="text-sm opacity-80">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  // --- 1. เพิ่ม state สำหรับโหมดของ Modal ---
  const [modalMode, setModalMode] = useState('create'); 

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    fetchSummary();
  }, [fetchSummary]);

  // --- 2. อัปเดตฟังก์ชัน openModal ให้รับ mode ได้ ---
  const openModal = (mode, ticketId = null) => {
    setModalMode(mode);
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    fetchSummary();
  };

  if (loading || !summary) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  const ticketsByStatusData = {
    labels: summary.ticketsByStatus.map((item) => item.status),
    datasets: [
      {
        data: summary.ticketsByStatus.map((item) => item.count),
        backgroundColor: [
          "#60A5FA",
          "#FBBF24",
          "#34D399",
          "#F87171",
          "#9CA3AF",
        ],
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ],
  };
  const doughnutOptions = {
    cutout: "60%",
    plugins: {
      legend: { position: "right", labels: { boxWidth: 12, padding: 15 } },
    },
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">System Overview as of {currentDate}</p>
      </div>

      {/* --- Quick Actions --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          to="/add"
          icon={<FiPlusCircle className="w-6 h-6 text-blue-500" />}
          title="Add New Asset"
          subtitle="Add a single IT device"
        />
        {/* --- 3. เปลี่ยน ActionButton ให้ใช้ onClick เพื่อเปิด Modal --- */}
        <ActionButton
          onClick={() => openModal('create')}
          icon={<FiEdit className="w-6 h-6 text-green-500" />}
          title="Create Ticket"
          subtitle="Open a repair request for admin"
        />
        <ActionButton
          to="/import"
          icon={<FiUpload className="w-6 h-6 text-purple-500" />}
          title="Import Data"
          subtitle="Add multiple assets from a file"
        />
        <ActionButton
          to="/settings/users"
          icon={<FiUserPlus className="w-6 h-6 text-yellow-500" />}
          title="Add User"
          subtitle="Manage user information"
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: Stat Cards & Recent Tickets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/assets" className="group">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full">
                <StatCard
                  title="Total Assets"
                  value={summary.assetCount}
                  color="bg-blue-500 text-white"
                />
              </div>
            </Link>
            <Link to="/assets?filter=incomplete" className="group">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full">
                <StatCard
                  title="Assets with Incomplete Data"
                  value={summary.incompleteAssetCount}
                  color="bg-red-500 text-white"
                />
              </div>
            </Link>
            <StatCard
              title="Ongoing Tasks"
              value={summary.inProgressCount}
              color="bg-yellow-500 text-white"
            />
            <Link to="/tickets" className="group">
              <div className="transition-transform duration-300 group-hover:scale-105 h-full">
                <StatCard
                  title="Total Tickets"
                  value={summary.ticketCount}
                  color="bg-gray-700 text-white"
                />
              </div>
            </Link>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-4">Latest Repair Requests</h3>
            <ul className="divide-y divide-gray-100">
              {summary.recentTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  onClick={() => openModal('update', ticket.id)}
                  className="py-3 group cursor-pointer"
                >
                  <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {ticket.problem_description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ticket.reporter_name} -{" "}
                    <span className="font-semibold">{ticket.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* คอลัมน์ขวา: กราฟสรุปสถานะ */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h3 className="font-bold text-lg mb-4">Repair Request Status Summary</h3>
          <div className="flex-grow flex items-center justify-center">
            <Doughnut data={ticketsByStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* --- 6. เพิ่ม Component Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Ticket Form Modal"
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <button onClick={closeModal} className="modal-close-button">
          &times;
        </button>
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

export default DashboardPage;