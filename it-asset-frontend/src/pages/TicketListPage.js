import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import Modal from "react-modal";
import TicketFormModal from "../components/TicketFormModal";

import {
  FaPlus,
  FaFilter,
  FaBroom,
  FaEdit,
  FaTrashAlt,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

Modal.setAppElement("#root");

const StatusIcon = ({ status }) => {
  switch (status) {
    case "In Progress":
      return <FaSpinner className="animate-spin text-blue-500" />;
    case "Success":
      return <FaCheckCircle className="text-green-500" />;
    case "Wait":
      return <FaClock className="text-yellow-500" />;
    case "Cancel":
      return <FaTimesCircle className="text-red-500" />;
    default:
      return <FaExclamationTriangle className="text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "In Progress":
      return "status-badge-in-progress";
    case "Success":
      return "status-badge-success";
    case "Wait":
      return "status-badge-wait";
    case "Cancel":
      return "status-badge-cancel";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  const [statusCounts, setStatusCounts] = useState({
    Request: 0,
    Wait: 0,
    InProgress: 0,
    Success: 0,
    Cancel: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);

      const statusValues = [
        "Request",
        "Wait",
        "In Progress",
        "Success",
        "Cancel",
      ];
      const counts = {};
      for (const status of statusValues) {
        const res = await api.get("/tickets", {
          params: { status: status, limit: 1 },
        });
        counts[status.replace(/\s/g, "")] = res.data.totalItems;
      }
      setStatusCounts(counts);

      const res = await api.get("/tickets", {
        params: {
          ...filters,
          page: currentPage,
          limit: limit,
        },
      });

      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      console.error(
        "Failed to fetch tickets",
        err.response ? err.response.data : err.message
      );
      setError("Unable to load repair tickets.");
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleStatusClick = (status) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: status,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setCurrentPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

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
    fetchTickets();
  };

  const handleDeleteClick = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this repair ticket?")) {
      try {
        await api.delete(`/tickets/${ticketId}`);
        fetchTickets();
        alert("Repair ticket deleted successfully!");
      } catch (err) {
        console.error(
          "Failed to delete ticket:",
          err.response ? err.response.data : err.message
        );
        alert(
          "Error deleting repair ticket: " +
            (err.response?.data?.msg || err.message)
        );
      }
    }
  };

  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Repair Tickets</h2>
        <button
          onClick={() => openModal("create")}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          <span>Create Repair Ticket</span>
        </button>
      </div>

      {/* เพิ่มส่วนแสดงสถานะและจำนวน */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={() => handleStatusClick("")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          All
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.Request +
              statusCounts.Wait +
              statusCounts.InProgress +
              statusCounts.Success +
              statusCounts.Cancel}
          </span>
        </button>
        <button
          onClick={() => handleStatusClick("Request")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === "Request"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Request
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.Request}
          </span>
        </button>
        <button
          onClick={() => handleStatusClick("Wait")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === "Wait"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Wait
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.Wait}
          </span>
        </button>
        <button
          onClick={() => handleStatusClick("In Progress")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === "In Progress"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          In Progress
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.InProgress}
          </span>
        </button>
        <button
          onClick={() => handleStatusClick("Success")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === "Success"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Success
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.Success}
          </span>
        </button>
        <button
          onClick={() => handleStatusClick("Cancel")}
          className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors ${
            filters.status === "Cancel"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Cancel
          <span className="bg-white text-gray-800 font-bold px-2 py-1 rounded-full text-xs">
            {statusCounts.Cancel}
          </span>
        </button>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex flex-wrap items-end gap-4">
          {/* ลบส่วน Status dropdown ออก */}
          <div className="flex-grow" style={{ minWidth: "150px" }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full"
            />
          </div>
          <div className="flex-grow" style={{ minWidth: "150px" }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full"
            />
          </div>
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full bg-white text-gray-700 font-semibold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <FaBroom />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-16 text-gray-500 text-xl">
          Loading data...
        </div>
      ) : error ? (
        <div className="text-center p-16 text-red-600">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold">No Repair Tickets Found</h3>
          <p className="mt-2">
            Try adjusting the filters or there may be no data in the system.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-blue-600">
                <tr>
                  <th className="p-3 font-semibold text-white">
                    Reported Date
                  </th>
                  <th className="p-3 font-semibold text-white">IT Asset</th>
                  <th className="p-3 font-semibold text-white">Reporter</th>
                  <th className="p-3 font-semibold text-white w-1/4">Issue</th>
                  <th className="p-3 font-semibold text-white w-1/4">
                    Solution
                  </th>
                  <th className="p-3 font-semibold text-white">Handler</th>
                  <th className="p-3 font-semibold text-white">Status</th>
                  <th className="p-3 font-semibold text-white text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 align-middle text-gray-800">
                      {new Date(ticket.report_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                      <br />
                      {new Date(ticket.report_date).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td className="p-3 align-middle text-gray-800">
                      {ticket.asset_code}
                    </td>
                    <td className="p-3 align-middle text-gray-800">
                      {ticket.reporter_name}
                    </td>
                    <td className="p-3 align-middle font-medium text-gray-900 break-words">
                      {ticket.problem_description}
                    </td>
                    <td className="p-3 align-middle text-gray-800 break-words">
                      {ticket.solution || ""}
                    </td>
                    <td className="p-3 align-middle text-gray-800">
                      {ticket.handler_name || ""}
                    </td>
                    <td className="p-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        <StatusIcon status={ticket.status} />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openModal("update", ticket.id)}
                          className="bg-blue-500 hover:bg-blue-600 table-action-button"
                          title="Update"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(ticket.id)}
                          className="bg-red-500 hover:bg-red-600 text-white table-action-button"
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
            <div className="flex items-center justify-between mt-4">
            {/* ... (ส่วนแสดง Rows per page) ... */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({totalItems} items)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

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

export default TicketListPage;
