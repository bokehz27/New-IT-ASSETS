import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select from "react-select";

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

// --- Component ใหม่สำหรับฟอร์มใน Modal ---
function TicketFormModal({ mode, ticketId, onSuccess, onCancel }) {
  // --- States สำหรับฟอร์ม ---
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
  
  // --- States สำหรับตัวเลือก Dropdown และการทำงานของฟอร์ม ---
  const [options, setOptions] = useState({
    assetOptions: [],
    adminOptions: [],
    repairTypeOptions: [],
    reporterOptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // --- โหลดข้อมูล Dropdown และข้อมูล Ticket (กรณีแก้ไข) ---
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
        assetOptions: assetRes.data.map(asset => ({ value: asset.asset_code, label: `${asset.asset_code} ${asset.model ? `- ${asset.model}` : ""}`})),
        adminOptions: adminRes.data.map(admin => ({ value: admin.username, label: admin.username })),
        repairTypeOptions: repairTypeRes.data.map(item => ({ value: item.value, label: item.value })),
        reporterOptions: reporterRes.data.map(name => ({ value: name, label: name })),
      });

      // ถ้าเป็นโหมดแก้ไข ให้โหลดข้อมูล Ticket มาใส่ในฟอร์ม
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
      setMessage("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, [mode, ticketId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- จัดการการ Submit ฟอร์ม ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketData.reporterName || !ticketData.assetCode || !ticketData.problemDescription) {
        setMessage("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
        return;
    }
    setSubmitting(true);
    setMessage("");

    const combinedData = {
        ...ticketData,
        ...adminData
    };
    
    // แปลงชื่อ Key ให้ตรงกับที่ Backend ต้องการ
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
            // ในโหมดสร้าง เราต้องส่งเป็น FormData หากมีการแนบไฟล์
            // ในที่นี้สมมติว่าไม่มีการแนบไฟล์เพื่อความง่าย
            await axios.post(`${API_URL}/public/tickets`, payload, headers);
        }
        onSuccess(); // เรียก Callback เพื่อปิด Modal และโหลดข้อมูลใหม่
    } catch (err) {
        console.error("Failed to submit ticket:", err.response);
        setMessage(err.response?.data?.error || "เกิดข้อผิดพลาดบางอย่าง");
    } finally {
        setSubmitting(false);
    }
  };
  
  if (loading) return <div className="text-center p-8">Loading Form...</div>;

  // --- ตัวเลือกสำหรับ Status ---
  const statusOptions = [
    { value: "Wait", label: "Wait" },
    { value: "In Progress", label: "In Progress" },
    { value: "Success", label: "Success" },
    { value: "Cancel", label: "Cancel" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === 'update' ? `แก้ไขรายการแจ้งซ่อม #${ticketId}` : 'สร้างรายการแจ้งซ่อมใหม่'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* --- คอลัมน์ซ้าย: ข้อมูลผู้แจ้ง --- */}
            <div className="space-y-4 p-4 border rounded-lg bg-white">
              <h3 className="font-semibold text-lg text-gray-700">ข้อมูลผู้แจ้งและปัญหา</h3>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">ชื่อผู้แจ้ง <span className="text-red-500">*</span></label>
                <Select
                  classNamePrefix="react-select"
                  options={options.reporterOptions}
                  value={options.reporterOptions.find(o => o.value === ticketData.reporterName)}
                  onChange={opt => setTicketData({...ticketData, reporterName: opt ? opt.value : ""})}
                  placeholder="ค้นหาชื่อ..."
                  isDisabled={mode === 'update'} // แก้ไขชื่อผู้แจ้งไม่ได้
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">รหัสอุปกรณ์ <span className="text-red-500">*</span></label>
                <Select
                  classNamePrefix="react-select"
                  options={options.assetOptions}
                  value={options.assetOptions.find(o => o.value === ticketData.assetCode)}
                  onChange={opt => setTicketData({...ticketData, assetCode: opt ? opt.value : ""})}
                  placeholder="ค้นหารหัสอุปกรณ์..."
                  isDisabled={mode === 'update'} // แก้ไขรหัสอุปกรณ์ไม่ได้
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">เบอร์ติดต่อ</label>
                <input
                  type="text"
                  value={ticketData.contactPhone}
                  onChange={e => setTicketData({...ticketData, contactPhone: e.target.value})}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-600">รายละเอียดปัญหา <span className="text-red-500">*</span></label>
                <textarea
                  rows="4"
                  value={ticketData.problemDescription}
                  onChange={e => setTicketData({...ticketData, problemDescription: e.target.value})}
                ></textarea>
              </div>
            </div>

            {/* --- คอลัมน์ขวา: ส่วนของ Admin --- */}
            <div className="space-y-4 p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg text-gray-700">ส่วนของเจ้าหน้าที่</h3>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">ผู้ดำเนินการ</label>
                  <Select
                    classNamePrefix="react-select"
                    options={options.adminOptions}
                    value={options.adminOptions.find(o => o.value === adminData.handlerName)}
                    onChange={opt => setAdminData({...adminData, handlerName: opt ? opt.value : ""})}
                    placeholder="-- มอบหมาย --"
                    isClearable
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">ประเภทการซ่อม</label>
                  <Select
                    classNamePrefix="react-select"
                    options={options.repairTypeOptions}
                    value={options.repairTypeOptions.find(o => o.value === adminData.repairType)}
                    onChange={opt => setAdminData({...adminData, repairType: opt ? opt.value : ""})}
                    placeholder="-- เลือกประเภท --"
                    isClearable
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">สถานะ</label>
                  <Select
                    classNamePrefix="react-select"
                    options={statusOptions}
                    value={statusOptions.find(o => o.value === adminData.status)}
                    onChange={opt => setAdminData({...adminData, status: opt ? opt.value : "Wait"})}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">สาเหตุ / วิธีแก้ปัญหา</label>
                  <textarea
                    rows="4"
                    value={adminData.solution}
                    onChange={e => setAdminData({...adminData, solution: e.target.value})}
                  ></textarea>
                </div>
            </div>

        </div>

        {/* --- ส่วนของปุ่ม Submit และข้อความ Error --- */}
        <div className="mt-6 flex items-center justify-between">
            <div>
                {message && <p className="text-red-600 font-semibold">{message}</p>}
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300">
                ยกเลิก
              </button>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
        </div>
      </form>
    </div>
  );
}

export default TicketFormModal;