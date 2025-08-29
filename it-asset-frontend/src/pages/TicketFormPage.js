// src/pages/TicketFormPage.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SearchableDropdown from "../components/SearchableDropdown"; // ปรับ path ตามโปรเจกต์

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";

export default function TicketFormPage() {
  const [options, setOptions] = useState({ reporterOptions: [], assetOptions: [] });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [successUrl, setSuccessUrl] = useState(""); // url ของไฟล์ที่อัปโหลด (จาก response)
  const [loading, setLoading] = useState(true);

  const [ticketData, setTicketData] = useState({
    reporterName: "",
    assetCode: "",
    contactPhone: "",
    problemDescription: "",
  });

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const [reporterRes, assetRes] = await Promise.all([
        axios.get(`${API_URL}/public/asset-users`),
        axios.get(`${API_URL}/public/assets-list`),
      ]);
      setOptions({
        reporterOptions: (reporterRes.data || []).map(n => ({ value: n, label: n })),
        assetOptions: (assetRes.data || []).map(a => ({ value: a.asset_code, label: `${a.asset_code}${a.model ? ` - ${a.model}` : ""}` })),
      });
    } catch (e) {
      setMessage("Failed to load options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessUrl("");

    const { reporterName, assetCode, problemDescription } = ticketData;
    if (!reporterName || !assetCode || !problemDescription) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const fd = new FormData();
    fd.append("reporter_name", ticketData.reporterName);
    fd.append("asset_code", ticketData.assetCode);
    fd.append("contact_phone", ticketData.contactPhone);
    fd.append("problem_description", ticketData.problemDescription);
    if (file) fd.append("attachment_user", file);

    try {
      const res = await axios.post(`${API_URL}/public/tickets`, fd);
      setMessage("Submitted!");
      setSuccessUrl(res.data?.attachment_user_url || "");
      setTicketData({ reporterName: "", assetCode: "", contactPhone: "", problemDescription: "" });
      setFile(null);
    } catch (e) {
      setMessage(e.response?.data?.error || "Failed to submit.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Repair Request</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 border rounded-lg">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Reporter Name <span className="text-red-500">*</span></label>
          <SearchableDropdown
            options={options.reporterOptions}
            value={ticketData.reporterName}
            onChange={(val) => setTicketData((p) => ({ ...p, reporterName: val || "" }))}
            placeholder="Search name..."
            idPrefix="user-dd-reporter"
            menuZIndex={10000}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Asset Code <span className="text-red-500">*</span></label>
          <SearchableDropdown
            options={options.assetOptions}
            value={ticketData.assetCode}
            onChange={(val) => setTicketData((p) => ({ ...p, assetCode: val || "" }))}
            placeholder="Search asset code..."
            idPrefix="user-dd-asset"
            menuZIndex={10000}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Contact Phone</label>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={ticketData.contactPhone}
            onChange={(e) => setTicketData((p) => ({ ...p, contactPhone: e.target.value }))}
            placeholder="08x-xxx-xxxx"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Problem Description <span className="text-red-500">*</span></label>
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2"
            rows={4}
            value={ticketData.problemDescription}
            onChange={(e) => setTicketData((p) => ({ ...p, problemDescription: e.target.value }))}
            placeholder="Describe the problem..."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Attachment (optional)</label>
          <div className="flex items-center gap-3">
            <label htmlFor="user-upload" className="inline-flex items-center gap-2 rounded border px-3 py-2 cursor-pointer hover:bg-gray-50">
              <span>Select file</span>
            </label>
            <input id="user-upload" type="file" className="hidden" onChange={(e)=>setFile(e.target.files?.[0]||null)}/>
            <span className="text-sm text-gray-500">{file?.name || "No file"}</span>
            {successUrl && (
              <a href={successUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline">View last uploaded</a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">{message && <span className="font-semibold">{message}</span>}</div>
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700">Submit</button>
        </div>
      </form>
    </div>
  );
}
