import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// --- IMPROVEMENT 4: ย้าย customSelectStyles ออกมาไว้ที่เดียว และลบส่วนที่ซ้ำซ้อนใน useEffect ---
// สไตล์สำหรับ React-Select จะถูกใช้ร่วมกันทุก components
const customSelectStyles = {
  // Styles จากไฟล์ index.css ถูกนำมาใช้โดย classNamePrefix="react-select" อยู่แล้ว
  // แต่ถ้าต้องการ override เพิ่มเติม สามารถทำที่นี่ได้
  // ในที่นี้เราใช้จาก CSS เป็นหลัก ดังนั้น object นี้อาจไม่จำเป็นต้องมีเนื้อหาเยอะ
  // แต่การประกาศไว้เพื่อส่ง props ทำให้โค้ดอ่านง่าย
};

function AdminTicketFormPage() {
  // --- IMPROVEMENT: จัดกลุ่ม State เพื่อให้อ่านง่ายขึ้น (ทางเลือก) ---
  const [ticketData, setTicketData] = useState({
    reporterName: "",
    assetCode: "",
    contactPhone: "",
    problemDescription: "",
  });
  const [adminData, setAdminData] = useState({
    handlerName: "",
    status: "Wait", // กำหนดค่าเริ่มต้น
    repairType: "",
    solution: "",
  });
  
  const [attachment, setAttachment] = useState(null);
  const [options, setOptions] = useState({
    assetOptions: [],
    adminOptions: [],
    repairTypeOptions: [],
    reporterOptions: [],
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDataForAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch data พร้อมกันเพื่อประสิทธิภาพที่ดีขึ้น
        const [assetRes, adminRes, repairTypeRes, reporterRes] = await Promise.all([
          axios.get("http://172.18.1.61:5000/api/public/assets-list", { headers: { "x-auth-token": token } }),
          axios.get("http://172.18.1.61:5000/api/users", { headers: { "x-auth-token": token } }),
          axios.get("http://172.18.1.61:5000/api/master-data/repair_type", { headers: { "x-auth-token": token } }),
          axios.get("http://172.18.1.61:5000/api/public/asset-users", { headers: { "x-auth-token": token } })
        ]);

        setOptions({
          assetOptions: assetRes.data.map((asset) => ({
            value: asset.asset_code,
            label: `${asset.asset_code} ${asset.model ? `- ${asset.model}` : ""}`,
          })),
          // --- IMPROVEMENT 1: เตรียมข้อมูลสำหรับ React-Select ---
          adminOptions: adminRes.data.map((admin) => ({
            value: admin.username,
            label: admin.username,
          })),
          repairTypeOptions: repairTypeRes.data.map((item) => ({
            value: item.value,
            label: item.value,
          })),
          reporterOptions: reporterRes.data.map((name) => ({ 
            value: name, 
            label: name 
          })),
        });

      } catch (err) {
        console.error("Failed to fetch admin form data:", err.response ? err.response.data : err.message);
        setMessage("ไม่สามารถโหลดข้อมูลสำหรับฟอร์ม Admin ได้");
        setMessageType("error");
      }
    };
    fetchDataForAdmin();
  }, [navigate]);

  const handleFileChange = (e) => setAttachment(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setSubmitting(true);

    if (!ticketData.reporterName || !ticketData.assetCode || !ticketData.problemDescription) {
      setMessage("กรุณากรอกข้อมูลที่จำเป็น: ชื่อผู้แจ้ง, รหัสอุปกรณ์, และรายละเอียดปัญหา");
      setMessageType("error");
      setSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("reporter_name", ticketData.reporterName);
    formDataToSend.append("asset_code", ticketData.assetCode);
    formDataToSend.append("problem_description", ticketData.problemDescription);
    formDataToSend.append("contact_phone", ticketData.contactPhone);
    if (attachment) formDataToSend.append("attachment", attachment);
    formDataToSend.append("handler_name", adminData.handlerName);
    formDataToSend.append("status", adminData.status);
    formDataToSend.append("repair_type", adminData.repairType);
    formDataToSend.append("solution", adminData.solution);

    try {
      await axios.post(
        "http://172.18.1.61:5000/api/public/tickets",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data", "x-auth-token": localStorage.getItem("token") } }
      );
      setMessage("สร้างรายการแจ้งซ่อมสำเร็จ!");
      setMessageType("success");
      setTimeout(() => navigate("/tickets"), 2000);
    } catch (err) {
      console.error("Failed to create ticket:", err.response ? err.response.data : err.message);
      setMessage(`แจ้งซ่อมไม่สำเร็จ: ${err.response?.data?.error || err.message}`);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };
  
  // ตัวเลือกสำหรับ Status
  const statusOptions = [
    { value: "Wait", label: "Wait" },
    { value: "In Progress", label: "In Progress" },
    { value: "Success", label: "Success" },
    { value: "Cancel", label: "Cancel" },
  ];

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          สร้างรายการแจ้งซ่อม (สำหรับ Admin)
        </h2>

        {message && (
          <div className={`p-4 mb-6 rounded-md text-center font-semibold ${ messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- IMPROVEMENT 2: ใช้ grid และ เพิ่มเส้นแบ่งเพื่อความชัดเจน --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            
            {/* คอลัมน์ซ้าย */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                ข้อมูลผู้แจ้งและปัญหา
              </h3>
              <div>
                {/* --- IMPROVEMENT 3: เพิ่ม * สำหรับฟิลด์ที่จำเป็น --- */}
                <label className="block mb-1 text-sm font-semibold text-gray-700">ชื่อผู้แจ้ง: <span className="text-red-500">*</span></label>
                <Select
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  options={options.reporterOptions}
                  onChange={(option) => setTicketData({...ticketData, reporterName: option ? option.value : ""})}
                  value={options.reporterOptions.find(opt => opt.value === ticketData.reporterName)}
                  placeholder="-- ค้นหาหรือเลือกชื่อผู้แจ้ง --"
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">รหัสอุปกรณ์: <span className="text-red-500">*</span></label>
                <Select
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  options={options.assetOptions}
                  onChange={(option) => setTicketData({...ticketData, assetCode: option ? option.value : ""})}
                  value={options.assetOptions.find(opt => opt.value === ticketData.assetCode)}
                  placeholder="-- ค้นหาหรือเลือกรหัสอุปกรณ์ --"
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">เบอร์ติดต่อ:</label>
                <input
                  type="text"
                  value={ticketData.contactPhone}
                  onChange={(e) => setTicketData({...ticketData, contactPhone: e.target.value})}
                  placeholder="เบอร์โทรศัพท์สำหรับติดต่อกลับ"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">รายละเอียดปัญหา: <span className="text-red-500">*</span></label>
                <textarea
                  value={ticketData.problemDescription}
                  onChange={(e) => setTicketData({...ticketData, problemDescription: e.target.value})}
                  rows="5"
                  className="w-full"
                ></textarea>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">ไฟล์แนบ:</label>
                <div className="flex items-center gap-4">
                  <label htmlFor="admin-attachment-input" className="file-input-label">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>เลือกไฟล์</span>
                  </label>
                  <span className="text-sm text-gray-500 truncate max-w-xs">
                    {attachment ? attachment.name : "ยังไม่ได้เลือกไฟล์"}
                  </span>
                </div>
                <input id="admin-attachment-input" type="file" onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div className="space-y-4 mt-6 md:mt-0">
               <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                ข้อมูลสำหรับ Admin
              </h3>
               {/* --- IMPROVEMENT 1: เปลี่ยนมาใช้ React-Select ทั้งหมด --- */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">ผู้ดำเนินการ:</label>
                <Select
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  options={options.adminOptions}
                  onChange={(option) => setAdminData({...adminData, handlerName: option ? option.value : ""})}
                  value={options.adminOptions.find(opt => opt.value === adminData.handlerName)}
                  placeholder="-- ยังไม่ได้มอบหมาย --"
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">สถานะ:</label>
                <Select
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  options={statusOptions}
                  onChange={(option) => setAdminData({...adminData, status: option ? option.value : "Wait"})}
                  value={statusOptions.find(opt => opt.value === adminData.status)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">ประเภทการซ่อม:</label>
                <Select
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  options={options.repairTypeOptions}
                  onChange={(option) => setAdminData({...adminData, repairType: option ? option.value : ""})}
                  value={options.repairTypeOptions.find(opt => opt.value === adminData.repairType)}
                  placeholder="-- เลือกประเภทการซ่อม --"
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">สาเหตุและวิธีแก้ปัญหา:</label>
                <textarea
                  value={adminData.solution}
                  onChange={(e) => setAdminData({...adminData, solution: e.target.value})}
                  rows="5"
                  className="w-full"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? "กำลังสร้าง..." : "สร้างรายการแจ้งซ่อม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminTicketFormPage;