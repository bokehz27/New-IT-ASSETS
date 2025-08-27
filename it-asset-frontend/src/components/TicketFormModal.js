import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchableDropdown from "./SearchableDropdown"; // ปรับ path ตามที่คุณวางไฟล์

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

function TicketFormModal({ mode, ticketId, onSuccess, onCancel }) {
  const [ticketData, setTicketData] = useState({
    reporterName: "",
    assetCode: "",
    contactPhone: "",
    problemDescription: "",
  });
  const [adminData, setAdminData] = useState({
    handlerName: "",
    status: "Wait",
    repairType: "",
    solution: "",
  });

  const [options, setOptions] = useState({
    assetOptions: [],
    adminOptions: [],
    repairTypeOptions: [],
    reporterOptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { "x-auth-token": token } };

      const [assetRes, adminRes, repairTypeRes, reporterRes] = await Promise.all([
        axios.get(`${API_URL}/public/assets-list`, headers),
        axios.get(`${API_URL}/users`, headers),
        axios.get(`${API_URL}/master-data/repair_type`, headers),
        axios.get(`${API_URL}/public/asset-users`, headers)
      ]);

      setOptions({
        assetOptions: assetRes.data.map(asset => ({
          value: asset.asset_code,
          label: `${asset.asset_code} ${asset.model ? `- ${asset.model}` : ""}`
        })),
        adminOptions: adminRes.data.map(admin => ({ value: admin.username, label: admin.username })),
        repairTypeOptions: repairTypeRes.data.map(item => ({ value: item.value, label: item.value })),
        reporterOptions: reporterRes.data.map(name => ({ value: name, label: name })),
      });

      if (mode === 'update' && ticketId) {
        const ticketRes = await axios.get(`${API_URL}/tickets/${ticketId}`, headers);
        const data = ticketRes.data;
        setTicketData({
          reporterName: data.reporter_name || "",
          assetCode: data.asset_code || "",
          contactPhone: data.contact_phone || "",
          problemDescription: data.problem_description || "",
        });
        setAdminData({
          handlerName: data.handler_name || "",
          status: data.status || "Wait",
          repairType: data.repair_type || "",
          solution: data.solution || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch form data:", err);
      setMessage("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [mode, ticketId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketData.reporterName || !ticketData.assetCode || !ticketData.problemDescription) {
      setMessage("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    const combinedData = { ...ticketData, ...adminData };

    const payload = {
      reporter_name: combinedData.reporterName,
      asset_code: combinedData.assetCode,
      contact_phone: combinedData.contactPhone,
      problem_description: combinedData.problemDescription,
      handler_name: combinedData.handlerName,
      status: combinedData.status,
      repair_type: combinedData.repairType,
      solution: combinedData.solution,
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { "x-auth-token": token } };

      if (mode === 'update') {
        await axios.put(`${API_URL}/tickets/${ticketId}`, payload, headers);
      } else {
        await axios.post(`${API_URL}/public/tickets`, payload, headers);
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to submit ticket:", err.response);
      setMessage(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading Form...</div>;

  const statusOptions = [
    { value: "Request", label: "Request" },
    { value: "Wait", label: "Wait" },
    { value: "In Progress", label: "In Progress" },
    { value: "Success", label: "Success" },
    { value: "Cancel", label: "Cancel" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === 'update' ? `Edit Repair Ticket #${ticketId}` : 'Create New Repair Ticket'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column: Reporter Info */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold text-lg text-gray-700">Reporter & Issue Details</h3>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Reporter Name <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={options.reporterOptions}
                value={ticketData.reporterName}
                onChange={(val) => setTicketData({ ...ticketData, reporterName: val || "" })}
                placeholder="Search name..."
                disabled={mode === 'update'}
                idPrefix="dd-reporter"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Asset Code <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={options.assetOptions}
                value={ticketData.assetCode}
                onChange={(val) => setTicketData({ ...ticketData, assetCode: val || "" })}
                placeholder="Search asset code..."
                disabled={mode === 'update'}
                idPrefix="dd-asset"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Contact Phone</label>
              <input
                type="text"
                value={ticketData.contactPhone}
                onChange={e => setTicketData({ ...ticketData, contactPhone: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                value={ticketData.problemDescription}
                onChange={e => setTicketData({ ...ticketData, problemDescription: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Describe the problem..."
              ></textarea>
            </div>
          </div>

          {/* Right Column: Admin Info */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold text-lg text-gray-700">Admin Section</h3>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Handler</label>
              <SearchableDropdown
                options={options.adminOptions}
                value={adminData.handlerName}
                onChange={(val) => setAdminData({ ...adminData, handlerName: val || "" })}
                placeholder="-- Assign --"
                idPrefix="dd-handler"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Repair Type</label>
              <SearchableDropdown
                options={options.repairTypeOptions}
                value={adminData.repairType}
                onChange={(val) => setAdminData({ ...adminData, repairType: val || "" })}
                placeholder="-- Select Type --"
                idPrefix="dd-repairtype"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Status</label>
              <SearchableDropdown
                options={statusOptions}
                value={adminData.status}
                onChange={(val) => setAdminData({ ...adminData, status: val || "Wait" })}
                placeholder="-- Status --"
                idPrefix="dd-status"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Cause / Solution</label>
              <textarea
                rows="4"
                value={adminData.solution}
                onChange={e => setAdminData({ ...adminData, solution: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Root cause / Solution taken..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div>{message && <p className="text-red-600 font-semibold">{message}</p>}</div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TicketFormModal;
