import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function AdminTicketFormPage() {
  const [reporterName, setReporterName] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [attachment, setAttachment] = useState(null); // State นี้ถูกใช้เพื่อแสดงชื่อไฟล์
  const [handlerName, setHandlerName] = useState("");
  const [status, setStatus] = useState("Request");
  const [repairType, setRepairType] = useState("");
  const [solution, setSolution] = useState("");
  const [assetOptions, setAssetOptions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [repairTypesOptions, setRepairTypesOptions] = useState([]);
  const [reporterOptions, setReporterOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // --- ส่วนของ Logic และ useEffect เหมือนเดิม ---
  useEffect(() => {
    const fetchDataForAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");

          const customSelectStyles = {
            control: (provided, state) => ({
              ...provided,
              backgroundColor: "var(--color-surface)",
              borderColor: state.isFocused
                ? "var(--color-primary)"
                : "var(--color-divider)",
              boxShadow: state.isFocused
                ? "0 0 0 1px var(--color-primary)"
                : "none",
              minHeight: "42px",
              borderRadius: "4px",
              transition:
                "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                borderColor: state.isFocused
                  ? "var(--color-primary)"
                  : "var(--color-divider)",
              },
            }),
            valueContainer: (provided) => ({
              ...provided,
              padding: "2px 12px",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "var(--color-text-secondary)",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "var(--color-text-primary)",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-divider)",
              boxShadow: "var(--elevation-8)",
              borderRadius: "4px",
              zIndex: 20,
            }),
            option: (provided, state) => ({
              ...provided,
              color: state.isSelected
                ? "var(--color-text-on-primary)"
                : "var(--color-text-primary)",
              backgroundColor: state.isSelected
                ? "var(--color-primary)"
                : state.isFocused
                ? "color-mix(in srgb, var(--color-primary) 8%, transparent)"
                : "var(--color-surface)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontWeight: state.isSelected ? 500 : 400,
              "&::after": {
                content: state.isSelected ? '"✓"' : '""',
                fontWeight: 700,
                marginLeft: "12px",
              },
            }),
            indicatorSeparator: (provided) => ({
              ...provided,
              backgroundColor: "var(--color-divider)",
            }),
            indicator: (provided) => ({
              ...provided,
              color: "var(--color-text-secondary)",
            }),
          };

          return;
        }

        const assetRes = await axios.get(
          "http://172.18.1.61:5000/api/public/assets-list",
          { headers: { "x-auth-token": token } }
        );
        setAssetOptions(
          assetRes.data.map((asset) => ({
            value: asset.asset_code,
            label: `${asset.asset_code} ${
              asset.model ? `- ${asset.model}` : ""
            }`,
          }))
        );

        const adminRes = await axios.get("http://172.18.1.61:5000/api/users", {
          headers: { "x-auth-token": token },
        });
        setAdmins(adminRes.data);

        const repairTypeRes = await axios.get(
          "http://172.18.1.61:5000/api/master-data/repair_type",
          { headers: { "x-auth-token": token } }
        );
        setRepairTypesOptions(repairTypeRes.data.map((item) => item.value));

        const reporterRes = await axios.get(
          "http://172.18.1.61:5000/api/public/asset-users",
          { headers: { "x-auth-token": token } }
        );
        setReporterOptions(
          reporterRes.data.map((name) => ({ value: name, label: name }))
        );
      } catch (err) {
        console.error(
          "Failed to fetch admin form data:",
          err.response ? err.response.data : err.message
        );
        setMessage("ไม่สามารถโหลดข้อมูลสำหรับฟอร์ม Admin ได้");
        setMessageType("error");
      }
    };
    fetchDataForAdmin();
  }, [navigate]);

  const handleAssetSelectChange = (selectedOption) =>
    setAssetCode(selectedOption ? selectedOption.value : "");
  const handleReporterSelectChange = (selectedOption) =>
    setReporterName(selectedOption ? selectedOption.value : "");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact_phone") setContactPhone(value);
    if (name === "problem_description") setProblemDescription(value);
    if (name === "solution") setSolution(value);
  };
  const handleFileChange = (e) => setAttachment(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setError("");
    setSubmitting(true);

    if (!reporterName || !assetCode || !problemDescription) {
      setError(
        "กรุณากรอกข้อมูลที่จำเป็น: ชื่อผู้แจ้ง, รหัสอุปกรณ์, และรายละเอียดปัญหา"
      );
      setSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("reporter_name", reporterName);
    formDataToSend.append("asset_code", assetCode);
    formDataToSend.append("problem_description", problemDescription);
    formDataToSend.append("contact_phone", contactPhone);
    if (attachment) formDataToSend.append("attachment", attachment);
    formDataToSend.append("handler_name", handlerName);
    formDataToSend.append("status", status);
    formDataToSend.append("repair_type", repairType);
    formDataToSend.append("solution", solution);

    try {
      const res = await axios.post(
        "http://172.18.1.61:5000/api/public/tickets",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
      setMessage("สร้างรายการแจ้งซ่อมสำเร็จ!");
      setMessageType("success");
      setTimeout(() => navigate("/tickets"), 3000);
    } catch (err) {
      console.error(
        "Failed to create ticket:",
        err.response ? err.response.data : err.message
      );
      setError(
        `แจ้งซ่อมไม่สำเร็จ: ${err.response?.data?.error || err.message}`
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "var(--color-surface)",
      borderColor: state.isFocused
        ? "var(--color-primary)"
        : "var(--color-divider)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary)" : "none",
      minHeight: "42px",
      borderRadius: "4px",
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--color-primary)"
          : "var(--color-divider)",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 12px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--color-text-secondary)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--color-text-primary)",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-divider)",
      boxShadow: "var(--elevation-8)",
      borderRadius: "4px",
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected
        ? "var(--color-text-on-primary)"
        : "var(--color-text-primary)",
      backgroundColor: state.isSelected
        ? "var(--color-primary)"
        : state.isFocused
        ? "color-mix(in srgb, var(--color-primary) 8%, transparent)"
        : "var(--color-surface)",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      fontWeight: state.isSelected ? 500 : 400,
      "&::after": {
        content: state.isSelected ? '"✓"' : '""',
        fontWeight: 700,
        marginLeft: "12px",
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-divider)",
    }),
    indicator: (provided) => ({
      ...provided,
      color: "var(--color-text-secondary)",
    }),
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          สร้างรายการแจ้งซ่อม (สำหรับ Admin)
        </h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-center ${
              messageType === "success"
                ? "bg-green-200 text-green-600"
                : "bg-red-200 text-red-600"
            }`}
          >
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 mb-4 rounded-md text-center bg-red-200 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* คอลัมน์ซ้าย */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                ข้อมูลผู้แจ้งและปัญหา
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    ชื่อผู้แจ้ง:
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    options={reporterOptions}
                    onChange={handleReporterSelectChange}
                    value={reporterOptions.find(
                      (option) => option.value === reporterName
                    )}
                    placeholder="-- ค้นหาหรือเลือกชื่อผู้แจ้ง --"
                    isClearable
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    รหัสอุปกรณ์:
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    options={assetOptions}
                    onChange={handleAssetSelectChange}
                    value={assetOptions.find(
                      (option) => option.value === assetCode
                    )}
                    placeholder="-- ค้นหาหรือเลือกรหัสอุปกรณ์ --"
                    isClearable
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    เบอร์ติดต่อ:
                  </label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={contactPhone}
                    onChange={handleInputChange}
                    placeholder="เบอร์โทรศัพท์สำหรับติดต่อกลับ"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    รายละเอียดปัญหา:
                  </label>
                  <textarea
                    name="problem_description"
                    value={problemDescription}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full"
                    required
                  ></textarea>
                </div>

                {/* --- ส่วนที่แก้ไข --- */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    ไฟล์แนบ:
                  </label>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="admin-attachment-input"
                      className="file-input-label"
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
                      <span>เลือกไฟล์</span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {attachment ? attachment.name : "ยังไม่ได้เลือกไฟล์"}
                    </span>
                  </div>
                  <input
                    id="admin-attachment-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {/* --- สิ้นสุดส่วนที่แก้ไข --- */}
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                ข้อมูลสำหรับ Admin
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-600">
                    ผู้ดำเนินการ:
                  </label>
                  <select
                    value={handlerName}
                    onChange={(e) => setHandlerName(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- ยังไม่ได้มอบหมาย --</option>
                    {admins.map((admin) => (
                      <option key={admin.username} value={admin.username}>
                        {admin.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-600">
                    สถานะ:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full"
                  >
                    <option value="Wait">Wait</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Success">Success</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-600">
                    ประเภทการซ่อม:
                  </label>
                  <select
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- เลือกประเภทการซ่อม --</option>
                    {repairTypesOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-600">
                    สาเหตุและวิธีแก้ปัญหา:
                  </label>
                  <textarea
                    name="solution"
                    value={solution}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
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
