// src/pages/PublicTicketListPage.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import PublicTicketFormModal from "../components/PublicTicketFormModal";
import {
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
const publicApi = axios.create({ baseURL: API_URL });

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

export default function PublicTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ค้นหาเดียว
  const [q, setQ] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // modal
  const [openForm, setOpenForm] = useState(false);

  // debounce
  const typingTimer = useRef(null);
  const DEBOUNCE_MS = 300;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, limit };
      if (q?.trim()) params.q = q.trim(); // ✅ ส่งพารามิเตอร์เดียวชื่อ q

      const res = await publicApi.get(`/public/tickets`, { params });
      setTickets(res.data?.tickets || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalItems(res.data?.totalItems || 0);
    } catch (e) {
      console.error(e);
      setError("Unable to load repair tickets.");
      setTickets([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onChangeSearch = (e) => {
    const value = e.target.value;
    setQ(value);
    setPage(1);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(fetchTickets, DEBOUNCE_MS);
  };

  const clearSearch = () => {
    setQ("");
    setPage(1);
    fetchTickets();
  };

  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* ✅ กว้างขึ้น */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">รายการแจ้งซ่อม</h2>

        <button
          type="button"
          onClick={() => setOpenForm(true)}
          className="bg-blue-600 text-white font-bold py-2 px-5 rounded-md hover:bg-blue-700"
        >
          แจ้งปัญหา
        </button>
      </div>

      {/* แถบค้นหาเดียว + rows per page */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={q}
                onChange={onChangeSearch}
                placeholder="รหัสพนักงาน, ชื่อผู้แจ้ง, รหัสอุปกรณ์"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              {q && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          <div className="md:ml-auto">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-gray-300 px-2 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
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
          <h3 className="text-2xl font-semibold">ไม่พบรายการแจ้งซ่อม</h3>
          <p className="mt-2">ลองใช้คำค้นหาอื่น</p>
        </div>
      ) : (
        <>
          {/* ✅ ตารางกว้างขึ้น และเรียงคอลัมน์แบบหน้าแอดมิน */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-[1100px] w-full text-sm text-left">
              {/* ✅ min width */}
              <thead className="bg-blue-600">
                <tr>
                  <th className="p-3 font-semibold text-white">วันที่แจ้ง</th>
                  <th className="p-3 font-semibold text-white">รหัสอุปกรณ์</th>
                  <th className="p-3 font-semibold text-white">ชื่อผู้แจ้ง</th>
                  <th className="p-3 font-semibold text-white w-1/4">ปัญหา</th>
                  <th className="p-3 font-semibold text-white w-1/4">
                    สาเหตุ / วิธีแก้ไข
                  </th>
                  <th className="p-3 font-semibold text-white">ผู้ดำเนินการ</th>
                  <th className="p-3 font-semibold text-white">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 align-middle text-gray-800">
                      {new Date(ticket.report_date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "2-digit", year: "numeric" }
                      )}
                      <br />
                      {new Date(ticket.report_date).toLocaleTimeString(
                        "en-GB",
                        { hour: "2-digit", minute: "2-digit" }
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages} ({totalItems} items)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <PublicTicketFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmitted={() => {
          setPage(1);
          fetchTickets();
        }}
      />
    </div>
  );
}
