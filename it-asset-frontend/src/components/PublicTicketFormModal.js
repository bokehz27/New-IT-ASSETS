// src/components/PublicTicketFormModal.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SearchableDropdown from "./SearchableDropdown";

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
const publicApi = axios.create({ baseURL: API_URL });

// ปุ่มกากบาทเล็ก ๆ
function ClearBtn({ onClick, title = "Remove" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-500 hover:bg-red-50"
    >
      ✕
    </button>
  );
}

function getFileNameFromUrl(u) {
  if (!u) return "";
  try {
    const clean = u.split("?")[0].split("#")[0];
    return clean.split("/").pop() || "";
  } catch {
    return "";
  }
}

export default function PublicTicketFormModal({ open, onClose, onSubmitted }) {
  const [options, setOptions] = useState({ reporterOptions: [], assetOptions: [] });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [successUrl, setSuccessUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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
        publicApi.get(`/public/asset-users`),
        publicApi.get(`/public/assets-list`),
      ]);
      setOptions({
        reporterOptions: (reporterRes.data || []).map((n) => ({ value: n, label: n })),
        assetOptions: (assetRes.data || []).map((a) => ({
          value: a.asset_code,
          label: `${a.asset_code}${a.model ? ` - ${a.model}` : ""}`,
        })),
      });
    } catch {
      setMessage("Failed to load options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTicketData({ reporterName: "", assetCode: "", contactPhone: "", problemDescription: "" });
      setFile(null);
      setSuccessUrl("");
      setMessage("");
      setSubmitted(false);
      fetchOptions();
    }
  }, [open, fetchOptions]);

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
      const res = await publicApi.post(`/public/tickets`, fd);
      setSuccessUrl(res.data?.attachment_user_url || "");
      setSubmitted(true); // ✅ ส่งเสร็จแล้ว

      onSubmitted && onSubmitted(res.data);

      // ✅ ปิด modal อัตโนมัติใน 3 วิ
      setTimeout(() => {
        onClose && onClose();
      }, 3000);
    } catch (e2) {
      setMessage(e2.response?.data?.error || "Failed to submit.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">แจ้งปัญหา (Repair Request)</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-center p-6">Loading Form...</div>
          ) : submitted ? (
            <div className="text-center p-10 text-green-600 font-bold text-lg">
              แจ้งปัญหาไปยัง IT แล้ว
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  ชื่อผู้แจ้ง <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={options.reporterOptions}
                  value={ticketData.reporterName}
                  onChange={(val) => setTicketData((p) => ({ ...p, reporterName: val || "" }))}
                  placeholder="ค้นหาชื่อ..."
                  idPrefix="public-dd-reporter"
                  menuZIndex={2000}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  รหัสอุปกรณ์ <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={options.assetOptions}
                  value={ticketData.assetCode}
                  onChange={(val) => setTicketData((p) => ({ ...p, assetCode: val || "" }))}
                  placeholder="ค้นหารหัสอุปกรณ์..."
                  idPrefix="public-dd-asset"
                  menuZIndex={2000}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">เบอร์ติดภายใน 4 หลัก</label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={ticketData.contactPhone}
                  onChange={(e) => setTicketData((p) => ({ ...p, contactPhone: e.target.value }))}
                  placeholder="xxxx"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  ปัญหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  rows={4}
                  value={ticketData.problemDescription}
                  onChange={(e) => setTicketData((p) => ({ ...p, problemDescription: e.target.value }))}
                  placeholder="อธิบายปัญหา..."
                />
              </div>

              {/* Attachment (User) */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">ไฟล์แนบ</label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="public-user-upload"
                    className="inline-flex items-center gap-2 rounded border px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <span>เลือกไฟล์</span>
                  </label>
                  <input
                    id="public-user-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <span className="text-sm text-gray-500">{file?.name || "ไม่มีไฟล์"}</span>
                  {file && <ClearBtn title="Remove selected file" onClick={() => setFile(null)} />}

                  {successUrl && (
                    <>
                      <a
                        href={successUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm underline"
                      >
                        View last uploaded ({getFileNameFromUrl(successUrl)})
                      </a>
                      <ClearBtn title="Clear last uploaded link (local only)" onClick={() => setSuccessUrl("")} />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>{message && <p className="text-red-600 font-semibold">{message}</p>}</div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-md hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
