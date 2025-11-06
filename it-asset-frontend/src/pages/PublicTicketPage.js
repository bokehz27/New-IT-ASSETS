// PublicTicketPage.js (ปรับแก้ Font-Size)

import React, { useState, useEffect, useRef } from "react";
import axios from "../api";
import { toast } from "react-toastify";

// PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import SearchableDropdown from "../components/SearchableDropdown";

// Lucide Icons
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

const PublicTicketPage = () => {
  const [tickets, setTickets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTicketData, setNewTicketData] = useState({});
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployeesData, setAllEmployeesData] = useState([]); // เก็บข้อมูลพนักงานทั้งหมด (ที่มีอีเมล)
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState(""); // เก็บอีเมลของคนที่ถูกเลือก
  const [showCorrectEmailInput, setShowCorrectEmailInput] = useState(false);
  const [issueAttachment, setIssueAttachment] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  useEffect(() => {
    fetchTickets();
    axios
      .get("/assets?all=true")
      .then((res) =>
        setAssets(res.data.map((a) => ({ label: a.asset_name, value: a.id })))
      )
      .catch((err) => console.error("Failed to fetch assets", err));

    axios
      .get("/employees")
      .then((res) => {
        // เก็บข้อมูลทั้งหมด (ที่มี object Email) ไว้ใน state ใหม่
        setAllEmployeesData(res.data);

        // สร้าง options สำหรับ dropdown เหมือนเดิม
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id })));
      })
      .catch((err) => console.error("Failed to fetch employees", err));
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("/tickets");
      setTickets(response.data);
    } catch {
      toast.error("Failed to fetch tickets.");
    }
  };

  const openNew = () => {
    setNewTicketData({});
    setIssueAttachment(null);
    setSelectedEmployeeEmail("");
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setIssueAttachment(null);
    setSelectedEmployeeEmail("");
  };

  const handleReportSubmit = async () => {
    if (
      !newTicketData.asset_id ||
      !newTicketData.employee_id ||
      !newTicketData.issue_description
    ) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    const payload = { ...newTicketData, status: "Pending" };
    Object.entries(payload).forEach(([k, v]) => v && formData.append(k, v));
    if (issueAttachment) formData.append("issue_attachment", issueAttachment);

    try {
      await axios.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ticket submitted successfully!");
      fetchTickets();
      hideDialog();
    } catch {
      toast.error("Failed to submit ticket.");
    }
  };

  // Toolbar templates
  const leftToolbarTemplate = () => (
    <Button
      label="แจ้งปัญหา"
      icon="pi pi-flag-fill"
      // ✨ [ปรับแก้] ปรับขนาด Padding และ Font Size ให้เหมือนหน้า Manage
      className="luxury-gradient-btn text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:opacity-90 transition-all"
      onClick={openNew}
    />
  );

  const rightToolbarTemplate = () => (
    <div className="relative w-full md:w-80">
      {/* ✨ [ปรับแก้] ปรับขนาดไอคอน */}
      <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search tickets..."
        // ✨ [ปรับแก้] ปรับ Padding และ Font Size
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
      />
    </div>
  );

  // Status display
  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      Pending: {
        Icon: Clock,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
        text: "Pending",
      },
      "In Progress": {
        Icon: Loader2,
        color: "text-blue-500",
        bg: "bg-blue-50",
        text: "In Progress",
        spin: true,
      },
      Completed: {
        Icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-50",
        text: "Completed",
      },
      Rejected: {
        Icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-50",
        text: "Rejected",
      },
    };

    const config = statusConfig[rowData.status] || {};
    const { Icon, color, bg, text, spin } = config;

    // ✨ [ปรับแก้] ปรับ UI ของ Tag Status ทั้งหมด
    return (
      <div className={`inline-flex items-center gap-1.5 py-1 rounded-md ${bg}`}>
        {Icon && (
          <Icon
            className={`${color} ${spin ? "animate-spin" : ""}`}
            size={10}
            strokeWidth={2.2}
          />
        )}
        <span className={`font-semibold ${color} text-xs px-1.5`}>{text}</span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    const date = new Date(rowData.created_at);
    const formattedDate = date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return (
      <div>
        <span>{formattedDate}</span>
        <br />
        <span className="text-gray-800 text-xs">{formattedTime}</span>
      </div>
    );
  };

  const issueBodyTemplate = (rowData) => (
    <div>
      <span>{rowData.issue_description}</span>
      {rowData.issue_attachment_path && (
        <div className="mt-2">
          <a
            href={`${process.env.REACT_APP_API_URL.replace("/api", "")}${
              rowData.issue_attachment_path
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline p-1 bg-blue-50 rounded"
          >
            📄 Attachments
          </a>
        </div>
      )}
    </div>
  );

  const solutionBodyTemplate = (rowData) => (
    <div>
      <span>{rowData.solution}</span>
      {rowData.solution_attachment_path && (
        <div className="mt-2">
          <a
            href={`${process.env.REACT_APP_API_URL.replace("/api", "")}${
              rowData.solution_attachment_path
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline p-1 bg-green-50 rounded"
          >
            📄 Attachments
          </a>
        </div>
      )}
    </div>
  );

  const dialogFooter = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-lg">
      <Button
        label="Cancel"
        onClick={hideDialog}
        className="px-4 py-2 font-semibold text-sm bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      />
      <Button
        label="Submit"
        onClick={handleReportSubmit}
        className="bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white px-4 py-2 rounded-md font-semibold shadow hover:opacity-90"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        แจ้งปัญหา / งานซ่อม
      </h1>

      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />
      <div className="overflow-x-auto">
        <DataTable
          ref={dt}
          value={tickets}
          dataKey="id"
          paginator
          rows={10}
          size="small"
          rowHover
          showGridlines
          globalFilter={globalFilter}
          emptyMessage="No tickets found."
          className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
        >
          {/* ✨ [ปรับแก้] เพิ่ม headerClassName และ bodyClassName ให้กับทุก Column */}
          <Column
            header="Request Date"
            body={dateBodyTemplate}
            sortable
            sortField="created_at"
            style={{ width: "110px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="Asset.asset_name"
            header="IT Asset"
            sortable
            filter
            filterPlaceholder="Search..."
            style={{ minWidth: "120px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="Employee.name"
            header="Requester"
            sortable
            style={{ minWidth: "180px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="internal_phone"
            header="Phone"
            style={{ width: "70px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="issue_description"
            header="Problem"
            body={issueBodyTemplate}
            bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="solution"
            header="Solution"
            body={solutionBodyTemplate}
            bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="handler.username"
            header="Operator"
            sortable
            style={{ minWidth: "115px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            header="Status"
            field="status"
            body={statusBodyTemplate}
            sortable
            style={{ width: "120px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
        </DataTable>
      </div>
      {/* Dialog ฟอร์มแจ้งปัญหา */}
      <Dialog
        visible={dialogVisible}
        style={{ width: "50vw", maxWidth: "700px" }}
        footer={dialogFooter}
        onHide={hideDialog}
        className="shadow-xl rounded-xl overflow-hidden"
        headerStyle={{ display: "none" }}
        contentStyle={{ padding: 0 }}
      >
        <div className="flex flex-col rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white rounded-t-xl">
            <h3 className="text-lg font-semibold">
              แจ้งซ่อมอุปกรณ์ (Report Issue)
            </h3>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 bg-white rounded-b-xl">
            <SearchableDropdown
              label="Asset ที่มีปัญหา *"
              idPrefix="sdd-public-asset"
              options={assets}
              value={newTicketData.asset_id}
              onChange={(v) =>
                setNewTicketData({ ...newTicketData, asset_id: v })
              }
              placeholder="เลือก Asset หรือพิมพ์เพื่อค้นหา"
            />

            <SearchableDropdown
              label="ชื่อผู้แจ้ง *"
              idPrefix="sdd-public-employee"
              options={employees}
              value={newTicketData.employee_id}
              // ✨ 4. [แก้ไข] onChange ของ "ชื่อผู้แจ้ง"
              onChange={(v) => {
                setNewTicketData({ ...newTicketData, employee_id: v });

                // ค้นหาข้อมูลพนักงานจาก ID ที่เลือก
                const selectedEmp = allEmployeesData.find((e) => e.id === v);

                // ตั้งค่าอีเมล (เช็คก่อนว่า .Email มีอยู่จริง)
                if (selectedEmp && selectedEmp.Email) {
                  setSelectedEmployeeEmail(selectedEmp.Email.email);
                } else {
                  setSelectedEmployeeEmail(""); // ถ้าไม่เจอให้เคลียร์ค่า
                }
              }}
              placeholder="เลือกชื่อของคุณ หรือพิมพ์เพื่อค้นหา"
            />

            {selectedEmployeeEmail && (
              <div className="space-y-2 mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  อีเมลปัจจุบัน
                </label>
                <InputText
                  value={selectedEmployeeEmail}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="incorrectEmail"
                    checked={showCorrectEmailInput}
                    onChange={(e) => setShowCorrectEmailInput(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-[#1976d2]"
                  />
                  <label
                    htmlFor="incorrectEmail"
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    อีเมลนี้ไม่ถูกต้อง
                  </label>
                </div>

                {showCorrectEmailInput && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมลที่ถูกต้อง
                    </label>
                    <InputText
                      type="email"
                      placeholder="กรอกอีเมลใหม่"
                      className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2]"
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          corrected_email: e.target.value,
                        })
                      }
                    />
                    <small className="text-xs text-gray-500">
                      ระบบจะบันทึกอีเมลนี้เพื่อแทนค่าที่ถูกต้อง
                    </small>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์ภายใน (4 หลัก)
              </label>
              <InputText
                value={newTicketData.internal_phone || ""}
                onChange={(e) =>
                  setNewTicketData({
                    ...newTicketData,
                    internal_phone: e.target.value,
                  })
                }
                keyfilter="pint"
                maxLength={4}
                // ✨ [ปรับแก้] ปรับ Padding
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อธิบายปัญหา *
              </label>
              <InputTextarea
                value={newTicketData.issue_description || ""}
                onChange={(e) =>
                  setNewTicketData({
                    ...newTicketData,
                    issue_description: e.target.value,
                  })
                }
                rows={5}
                // ✨ [ปรับแก้] ปรับ Padding
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
                autoResize
              />

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500">
                  แนบไฟล์ (ถ้ามี)
                </label>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setIssueAttachment(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PublicTicketPage;
