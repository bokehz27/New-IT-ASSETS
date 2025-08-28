// src/pages/TicketFormPage.js
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "../components/SearchableDropdown"; // ปรับ path ให้ตรงโปรเจกต์ของคุณ

function TicketFormPage() {
  const navigate = useNavigate();

  // options สำหรับดรอปดาวน์
  const [reporterOptions, setReporterOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);

  // ฟอร์มของ user เท่านั้น (ไม่มีส่วน admin)
  const [form, setForm] = useState({
    reporter_name: "",
    asset_code: "",
    contact_phone: "",
    problem_description: "",
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setMsg("");
      try {
        // ดึงรายชื่อผู้ใช้ (สาธารณะ)
        const u = await api.get("/public/asset-users");
        setReporterOptions(u.data.map((name) => ({ value: name, label: name })));

        // ดึงรายการทรัพย์สิน (สาธารณะ)
        const a = await api.get("/public/assets-list");
        setAssetOptions(
          a.data.map((asset) => ({
            value: asset.asset_code,
            label: `${asset.asset_code}${asset.model ? ` - ${asset.model}` : ""}`,
          }))
        );
      } catch (e) {
        console.error(e);
        setMsg("ไม่สามารถโหลดข้อมูลเริ่มต้นได้");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // ตรวจสอบข้อมูลขั้นต่ำ
    if (!form.reporter_name || !form.asset_code || !form.problem_description) {
      setMsg("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }

    setSubmitting(true);
    try {
      // ส่งเป็น multipart/form-data เพื่อรองรับไฟล์แนบ
      const fd = new FormData();
      fd.append("reporter_name", form.reporter_name);
      fd.append("asset_code", form.asset_code);
      fd.append("contact_phone", form.contact_phone);
      fd.append("problem_description", form.problem_description);
      if (attachment) fd.append("attachment", attachment);

      await api.post("/public/tickets", fd); // endpoint สาธารณะสำหรับสร้าง ticket
      alert("ส่งคำขอซ่อมเรียบร้อยแล้ว ขอบคุณค่ะ/ครับ");
      navigate("/"); // กลับหน้าแรกหรือเปลี่ยนเป็นหน้าที่คุณต้องการ
    } catch (err) {
      console.error(err);
      setMsg("เกิดข้อผิดพลาดระหว่างส่งคำขอ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto text-center">
        กำลังโหลดข้อมูลแบบฟอร์ม...
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">Report an Issue</h2>
      <p className="text-gray-500 mb-8">
        โปรดกรอกข้อมูลด้านล่างเพื่อแจ้งปัญหาไปยังฝ่าย IT
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ส่วนข้อมูลผู้แจ้ง & อุปกรณ์ */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Reporter & Device Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SearchableDropdown
                label="Reporter Name"
                idPrefix="dd-reporter"
                options={reporterOptions}
                value={form.reporter_name}
                onChange={(val) => setField("reporter_name", val || "")}
                placeholder="-- Search or select your name --"
              />
            </div>

            <div>
              <SearchableDropdown
                label="Asset Code"
                idPrefix="dd-asset"
                options={assetOptions}
                value={form.asset_code}
                onChange={(val) => setField("asset_code", val || "")}
                placeholder="-- Search or select asset code --"
              />
            </div>
          </div>
        </div>

        {/* รายละเอียดปัญหา */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Contact Phone
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Internal extension (4 digits)"
                value={form.contact_phone}
                onChange={(e) => setField("contact_phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Attach File (ถ้ามี)
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="attachment-input"
                  className="file-input-label inline-flex items-center gap-2 rounded border px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>Select File</span>
                </label>
                <span className="text-sm text-gray-500">
                  {attachment ? attachment.name : "No file selected"}
                </span>
              </div>
              <input
                id="attachment-input"
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Describe the Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="กรุณาอธิบายอาการ/ปัญหาโดยละเอียด..."
                value={form.problem_description}
                onChange={(e) => setField("problem_description", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* ปุ่มส่ง */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {msg && <p className="text-red-600 font-semibold">{msg}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 shadow-md hover:shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit Repair Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TicketFormPage;
