// src/pages/AssetTicketHistoryPage.js (Example Path)

import React, { useState, useEffect, useCallback } from "react";
// --- CHANGE 1: Import the central 'api' instance instead of 'axios' ---
import api from "../api"; // Adjust the path based on your project structure
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import TicketFormModal from "../components/TicketFormModal";
import { FaEdit } from "react-icons/fa";

// --- CHANGE 2: Remove the unnecessary API_URL constant ---
// const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

Modal.setAppElement("#root");

function AssetTicketHistoryPage() {
  const { assetCode } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      // --- CHANGE 3: Use the 'api' instance for the GET request ---
      // This is cleaner and automatically includes the auth token.
      const res = await api.get(`/tickets/asset/${assetCode}`);
      setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch ticket history", error);
    } finally {
      setLoading(false);
    }
  }, [assetCode]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    fetchHistory();
  };

  if (loading)
    return <div className="text-center p-10">Loading history...</div>;

  // --- No changes to JSX ---
  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-700">
          Repair History
        </h2>
        <p className="mb-6 text-gray-500">
          For IT Asset :{" "}
          <span className="font-semibold text-gray-800">{assetCode}</span>
        </p>

        {tickets.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-blue-600">
                <tr>
                  <th className="p-3 font-semibold text-white w-48">
                    Reported Date
                  </th>
                  <th className="p-3 font-semibold text-white w-40">
                    Reporter
                  </th>
                  <th className="p-3 font-semibold text-white">Issue</th>
                  <th className="p-3 font-semibold text-white">Solution</th>
                  <th className="p-3 font-semibold text-white w-32">Status</th>
                  <th className="p-3 font-semibold text-white w-40">Handler</th>
                  <th className="p-3 font-semibold text-white text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 align-middle whitespace-nowrap">
                      {new Date(ticket.report_date).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                      <br />
                      {new Date(ticket.report_date).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td className="p-3 align-middle">{ticket.reporter_name}</td>
                    <td className="p-3 align-middle break-words">
                      {ticket.problem_description}
                    </td>
                    <td className="p-3 align-middle break-words">
                      {ticket.solution || "N/A"}
                    </td>
                    <td className="p-3 align-middle">{ticket.status}</td>
                    <td className="p-3 align-middle">
                      {ticket.handler_name || "N/A"}
                    </td>
                    <td className="p-3 align-middle text-center">
                      <button
                        onClick={() => openModal(ticket.id)}
                        className="bg-blue-500 hover:bg-blue-600 table-action-button"
                        title="View/Update"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No repair history found for this device.
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Update Ticket Modal"
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <button onClick={closeModal} className="modal-close-button">
          &times;
        </button>
        <TicketFormModal
          mode="update"
          ticketId={selectedTicketId}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default AssetTicketHistoryPage;
