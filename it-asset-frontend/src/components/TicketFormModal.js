// src/components/TicketFormModal.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchableDropdown from "./SearchableDropdown";

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
// แปลงเป็นโฮสต์ของ backend (ตัด /api ออก)
const API_HOST = API_URL.replace(/\/api\/?$/, "");

// make "/uploads/xxx" -> "http://<backend-host>/uploads/xxx"
function toAbsoluteFileURL(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // ถ้ามาเป็น absolute อยู่แล้ว
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${API_HOST}${path}`;
}

// ดึงชื่อไฟล์ (พร้อมสกุลไฟล์) จาก URL หรือ path
function getFileName(u) {
  if (!u) return "";
  try {
    const clean = u.split("?")[0].split("#")[0];
    return clean.split("/").pop() || "";
  } catch {
    return "";
  }
}

// ปุ่มกากบาทแบบเล็กๆ ใช้ซ้ำได้
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

  const [userFile, setUserFile] = useState(null);
  const [adminFile, setAdminFile] = useState(null);
  // เก็บ “ค่าดิบ” จาก backend (relative path) แล้วค่อยแปลงตอน render
  const [links, setLinks] = useState({ user: "", admin: "" });

  // ธงสั่งลบไฟล์ใน backend
  const [removeUser, setRemoveUser] = useState(false);
  const [removeAdmin, setRemoveAdmin] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { "x-auth-token": token } };

      const [assetRes, adminRes, repairTypeRes, reporterRes] =
        await Promise.all([
          axios.get(`${API_URL}/public/assets-list`, headers),
          axios.get(`${API_URL}/users`, headers),
          axios.get(`${API_URL}/master-data/repair_type`, headers),
          axios.get(`${API_URL}/public/asset-users`, headers),
        ]);

      setOptions({
        assetOptions: (assetRes.data || []).map((a) => ({
          value: a.asset_code,
          label: `${a.asset_code}${a.model ? ` - ${a.model}` : ""}`,
        })),
        adminOptions: (adminRes.data || []).map((u) => ({
          value: u.username,
          label: u.username,
        })),
        repairTypeOptions: (repairTypeRes.data || []).map((i) => ({
          value: i.value,
          label: i.value,
        })),
        reporterOptions: (reporterRes.data || []).map((n) => ({
          value: n,
          label: n,
        })),
      });

      if (mode === "update" && ticketId) {
        const ticketRes = await axios.get(
          `${API_URL}/tickets/${ticketId}`,
          headers
        );
        const data = ticketRes.data || {};

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

        // เก็บค่า “relative path” ไว้ก่อน
        setLinks({
          user: data.attachment_user_url || data.attachment_url || "",
          admin: data.attachment_admin_url || "",
        });
        setRemoveUser(false);
        setRemoveAdmin(false);
      }
    } catch (err) {
      console.error(err);
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
    if (
      !ticketData.reporterName ||
      !ticketData.assetCode ||
      !ticketData.problemDescription
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (mode === "update") {
        // --- UPDATE ---
        const fd = new FormData();
        fd.append("reporter_name", ticketData.reporterName);
        fd.append("asset_code", ticketData.assetCode);
        fd.append("contact_phone", ticketData.contactPhone);
        fd.append("problem_description", ticketData.problemDescription);
        fd.append("handler_name", adminData.handlerName);
        fd.append("status", adminData.status);
        fd.append("repair_type", adminData.repairType);
        fd.append("solution", adminData.solution);
        if (userFile) fd.append("attachment_user", userFile);
        if (adminFile) fd.append("attachment_admin", adminFile);

        // ธงลบไฟล์
        if (removeUser) fd.append("remove_attachment_user", "true");
        if (removeAdmin) fd.append("remove_attachment_admin", "true");

        const res = await axios.put(`${API_URL}/tickets/${ticketId}`, fd, {
          headers: { "x-auth-token": token },
        });

        const d = res.data || {};
        setLinks({
          user: d.attachment_user_url || d.attachment_url || "",
          admin: d.attachment_admin_url || "",
        });
        setUserFile(null);
        setAdminFile(null);
        setRemoveUser(false);
        setRemoveAdmin(false);

        onSuccess && onSuccess();
      } else {
        // --- CREATE 2 ขั้นตอน ---
        const fdCreate = new FormData();
        fdCreate.append("reporter_name", ticketData.reporterName);
        fdCreate.append("asset_code", ticketData.assetCode);
        fdCreate.append("contact_phone", ticketData.contactPhone);
        fdCreate.append("problem_description", ticketData.problemDescription);
        if (userFile) fdCreate.append("attachment_user", userFile);

        const createRes = await axios.post(
          `${API_URL}/public/tickets`,
          fdCreate
        );
        const newId = createRes?.data?.id;
        if (!newId) throw new Error("Ticket created but missing id.");

        const fdAdmin = new FormData();
        fdAdmin.append("handler_name", adminData.handlerName);
        fdAdmin.append("status", adminData.status);
        fdAdmin.append("repair_type", adminData.repairType);
        fdAdmin.append("solution", adminData.solution);
        fdAdmin.append("reporter_name", ticketData.reporterName);
        fdAdmin.append("asset_code", ticketData.assetCode);
        fdAdmin.append("contact_phone", ticketData.contactPhone);
        fdAdmin.append("problem_description", ticketData.problemDescription);
        if (adminFile) fdAdmin.append("attachment_admin", adminFile);

        await axios.put(`${API_URL}/tickets/${newId}`, fdAdmin, {
          headers: { "x-auth-token": token },
        });

        setUserFile(null);
        setAdminFile(null);
        setRemoveUser(false);
        setRemoveAdmin(false);

        onSuccess && onSuccess();
      }
    } catch (err) {
      console.error("Failed to submit ticket:", err?.response || err);
      setMessage(err?.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading Form...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "update"
          ? `Edit Repair Ticket #${ticketId}`
          : "Create New Repair Ticket"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold text-lg text-gray-700">
              Reporter &amp; Issue Details
            </h3>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Reporter Name <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={options.reporterOptions}
                value={ticketData.reporterName}
                onChange={(val) =>
                  setTicketData({ ...ticketData, reporterName: val || "" })
                }
                placeholder="Search name..."
                idPrefix="dd-reporter"
                menuZIndex={10000}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Asset Code <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={options.assetOptions}
                value={ticketData.assetCode}
                onChange={(val) =>
                  setTicketData({ ...ticketData, assetCode: val || "" })
                }
                placeholder="Search asset code..."
                idPrefix="dd-asset"
                menuZIndex={10000}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Contact Phone
              </label>
              <input
                type="text"
                value={ticketData.contactPhone}
                onChange={(e) =>
                  setTicketData({ ...ticketData, contactPhone: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="xxxx"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                value={ticketData.problemDescription}
                onChange={(e) =>
                  setTicketData({
                    ...ticketData,
                    problemDescription: e.target.value,
                  })
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Describe the problem..."
              ></textarea>
            </div>

            {/* Attachment (User) */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Attachment (User)
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="ticket-user-file"
                  className="inline-flex items-center gap-2 rounded border px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <span>Select file</span>
                </label>
                <input
                  id="ticket-user-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setUserFile(f);
                    if (f) setRemoveUser(false);
                  }}
                />

                {/* ชื่อไฟล์ */}
                <span className="text-sm text-gray-500">
                  {userFile?.name || getFileName(links.user) || "No file"}
                </span>

                {/* View เดิม */}
                {links.user && (
                  <a
                    className="text-blue-600 text-sm underline"
                    href={toAbsoluteFileURL(links.user)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                )}

                {/* ปุ่มกากบาทเพื่อล้างไฟล์ */}
                {(userFile || links.user) && (
                  <ClearBtn
                    title="Remove user attachment"
                    onClick={() => {
                      setUserFile(null);
                      setLinks((prev) => ({ ...prev, user: "" }));
                      setRemoveUser(true); // แจ้ง backend ให้ลบไฟล์เดิม
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Admin Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold text-lg text-gray-700">
              Admin Section
            </h3>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Handler
              </label>
              <SearchableDropdown
                options={options.adminOptions}
                value={adminData.handlerName}
                onChange={(val) =>
                  setAdminData({ ...adminData, handlerName: val || "" })
                }
                placeholder="-- Assign --"
                idPrefix="dd-handler"
                menuZIndex={10000}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Repair Type
              </label>
              <SearchableDropdown
                options={options.repairTypeOptions}
                value={adminData.repairType}
                onChange={(val) =>
                  setAdminData({ ...adminData, repairType: val || "" })
                }
                placeholder="-- Select Type --"
                idPrefix="dd-repairtype"
                menuZIndex={10000}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Status
              </label>
              <SearchableDropdown
                options={[
                  { value: "Request", label: "Request" },
                  { value: "Wait", label: "Wait" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Success", label: "Success" },
                  { value: "Cancel", label: "Cancel" },
                ]}
                value={adminData.status}
                onChange={(val) =>
                  setAdminData({ ...adminData, status: val || "Wait" })
                }
                placeholder="-- Status --"
                idPrefix="dd-status"
                menuZIndex={10000}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Cause / Solution
              </label>
              <textarea
                rows="4"
                value={adminData.solution}
                onChange={(e) =>
                  setAdminData({ ...adminData, solution: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Root cause / Solution taken..."
              ></textarea>
            </div>

            {/* Attachment (Admin) */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Attachment (Admin)
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="ticket-admin-file"
                  className="inline-flex items-center gap-2 rounded border px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <span>Select file</span>
                </label>
                <input
                  id="ticket-admin-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAdminFile(f);
                    if (f) setRemoveAdmin(false);
                  }}
                />

                {/* ชื่อไฟล์ */}
                <span className="text-sm text-gray-500">
                  {adminFile?.name || getFileName(links.admin) || "No file"}
                </span>

                {/* View เดิม */}
                {links.admin && (
                  <a
                    className="text-blue-600 text-sm underline"
                    href={toAbsoluteFileURL(links.admin)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                )}

                {/* ปุ่มกากบาทเพื่อล้างไฟล์ */}
                {(adminFile || links.admin) && (
                  <ClearBtn
                    title="Remove admin attachment"
                    onClick={() => {
                      setAdminFile(null);
                      setLinks((prev) => ({ ...prev, admin: "" }));
                      setRemoveAdmin(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {message && <p className="text-red-600 font-semibold">{message}</p>}
          </div>
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TicketFormModal;
