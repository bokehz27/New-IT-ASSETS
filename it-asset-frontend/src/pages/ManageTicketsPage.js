import React, { useState, useEffect, useRef } from "react";
import axios from "../api";
import { toast } from "react-toastify";

// PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import SearchableDropdown from "../components/SearchableDropdown";
import {
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

const ManageTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  const repairTypes = [
    { label: "Hardware issue (PC,NB)", value: "Hardware" },
    { label: "Software error (PC,NB)", value: "Software" },
    { label: "Device driver error (PC,NB)", value: "Driver" },
    { label: "Install / upgrade software (PC,NB)", value: "Install" },
    { label: "Email issue", value: "Email" },
    { label: "Computer setting up", value: "Setup" },
    { label: "Active Directory error", value: "AD_Error" },
    { label: "Network / Infastructure", value: "Network" },
    { label: "Install network or equipment", value: "Install_Network" },
    { label: "Printer issue", value: "Printer" },
    { label: "User error", value: "User_Error" },
    { label: "User training", value: "Training" },
    { label: "Virus computer", value: "Virus" },
    { label: "MC Frame", value: "MC_Frame" },
    { label: "AX", value: "AX" },
    { label: "Maintenance", value: "Maintenance" },
    { label: "Therefore", value: "Therefore" },
    { label: "Edit / Transfer location", value: "Location_Change" },
    { label: "Replacement", value: "Replacement" },
    { label: "Other", value: "Other" },
  ];
  const statuses = ["Pending", "In Progress", "Completed", "Rejected"];

  const [issueAttachment, setIssueAttachment] = useState(null);
  const [solutionAttachment, setSolutionAttachment] = useState(null);

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
      .then((res) =>
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id })))
      )
      .catch((err) => console.error("Failed to fetch employees", err));
    axios
      .get("/users")
      .then((res) =>
        setUsers(res.data.map((u) => ({ label: u.username, value: u.id })))
      )
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to fetch tickets.");
    }
  };

  const openNew = () => {
    setCurrentTicket({ status: "Pending", repair_type: "Other" });
    setIssueAttachment(null);
    setSolutionAttachment(null);
    setDialogVisible(true);
  };

  const editTicket = (ticket) => {
    setCurrentTicket({ ...ticket });
    setIssueAttachment(null);
    setSolutionAttachment(null);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setCurrentTicket(null);
    // เคลียร์ค่าไฟล์เมื่อปิด Dialog
    setIssueAttachment(null);
    setSolutionAttachment(null);
  };

  const saveTicket = async () => {
    const formData = new FormData();

    // ใส่ข้อมูล ticket ทั้งหมดลงใน formData
    for (const key in currentTicket) {
      if (currentTicket[key] !== null && currentTicket[key] !== undefined) {
        formData.append(key, currentTicket[key]);
      }
    }

    // เพิ่มไฟล์แนบ (ถ้ามี)
    if (issueAttachment) {
      formData.append("issue_attachment", issueAttachment);
    }
    if (solutionAttachment) {
      formData.append("solution_attachment", solutionAttachment);
    }

    try {
      if (currentTicket.id) {
        await axios.put(`/tickets/${currentTicket.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Ticket updated successfully!");
      } else {
        await axios.post("/tickets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Ticket created successfully!");
      }
      fetchTickets();
      hideDialog();
    } catch (error) {
      toast.error("Failed to save ticket.");
    }
  };

  const deleteTicket = async (ticket) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await axios.delete(`/tickets/${ticket.id}`);
        toast.success("Ticket deleted successfully!");
        fetchTickets();
      } catch (error) {
        toast.error("Failed to delete ticket.");
      }
    }
  };

  // --- UI Templates ---
  const leftToolbarTemplate = () => (
    <Button
      label="New Ticket"
      icon="pi pi-plus"
      onClick={openNew}
      className="luxury-gradient-btn text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:opacity-90 transition-all"
    />
  );
  const rightToolbarTemplate = () => (
    <div className="relative w-full md:w-80">
      <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />{" "}
      {/* <--- ปรับขนาดไอคอน */}
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search tickets..."
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
      />
    </div>
  );

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

    if (!Icon) return <span>{rowData.status}</span>;

    return (
      <div className={`inline-flex items-center gap-1.5 py-1 rounded-md ${bg}`}>
        <Icon
          className={`${color} ${spin ? "animate-spin" : ""}`}
          size={10}
          strokeWidth={2.2}
        />
        {/* เพิ่ม px-1.5 ให้ข้อความเพื่อไม่ให้ชิดขอบเกินไป */}
        <span className={`font-semibold ${color} text-xs px-1.5`}>{text}</span>
      </div>
    );
  };

  // ✨ Template ใหม่สำหรับ Format วันที่
  const dateBodyTemplate = (rowData) => {
    // แปลงค่า created_at เป็น Object Date ของ JavaScript
    const date = new Date(rowData.created_at);

    // ตั้งค่ารูปแบบการแสดงผลสำหรับ "วันที่"
    const dateOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    // ตั้งค่ารูปแบบการแสดงผลสำหรับ "เวลา"
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // แสดงผลแบบ 24 ชั่วโมง
    };

    // ดึงค่าวันที่และเวลาออกมาเป็นข้อความ
    const formattedDate = date.toLocaleDateString("th-TH", dateOptions);
    const formattedTime = date.toLocaleTimeString("th-TH", timeOptions);

    // ส่งค่า JSX กลับไปแสดงผล โดยให้เวลาอยู่บรรทัดใหม่และเป็นสีเทา
    return (
      <div>
        <span>{formattedDate}</span>
        <br />
        <span className="text-gray-800 text-xs">{formattedTime}</span>
      </div>
    );
  };

  const issueBodyTemplate = (rowData) => {
    return (
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
  };

  const solutionBodyTemplate = (rowData) => {
    return (
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
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        onClick={() => editTicket(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => deleteTicket(rowData)}
      />
    </div>
  );

  // ✨ ปรับปรุงหน้าตาปุ่มใน Footer
  const dialogFooter = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-lg">
      <Button
        label="Cancel"
        onClick={hideDialog}
        className="px-4 py-2 font-semibold text-sm bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      />
      <Button
        label="Save"
        onClick={saveTicket}
        className="bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white px-4 py-2 rounded-md font-semibold shadow hover:opacity-90"
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        Manage Tickets
      </h1>

      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      ></Toolbar>

      <div className="overflow-x-auto">
        <DataTable
          ref={dt}
          value={tickets}
          dataKey="id"
          paginator
          rows={10}
          size="small"
          rowHover // ✨ เพิ่ม prop นี้
          showGridlines
          globalFilter={globalFilter}
          emptyMessage="No tickets found."
          // ✨ เพิ่ม datatable-hover-effect เข้าไปใน className
          className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
        >
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
            style={{ minWidth: "110px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="Employee.name"
            header="Requester"
            sortable
            style={{ minWidth: "150px" }}
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
            style={{ minWidth: "90px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            header="Status"
            field="status"
            body={statusBodyTemplate}
            sortable
            style={{ width: "90px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ width: "90px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
        </DataTable>
      </div>
      {/* ✨ ปรับปรุงฟอร์มใน Dialog */}
      <Dialog
        visible={dialogVisible}
        style={{ width: "70vw", maxWidth: "1000px" }} // <-- เพิ่มความกว้าง
        footer={dialogFooter}
        onHide={hideDialog}
        className="shadow-xl rounded-xl overflow-hidden"
        headerStyle={{ display: "none" }}
        contentStyle={{ padding: 0 }}
      >
        <div className="flex flex-col rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white rounded-t-xl">
            <h3 className="text-lg font-semibold">
              {currentTicket?.id ? "Edit Ticket" : "Create New Ticket"}
            </h3>
          </div>

          {/* ✨ [ปรับ Layout] เปลี่ยนจาก space-y-4 เป็น grid --- */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <SearchableDropdown
                label="Asset"
                idPrefix="sdd-asset"
                options={assets}
                value={currentTicket?.asset_id}
                onChange={(value) =>
                  setCurrentTicket({ ...currentTicket, asset_id: value })
                }
                placeholder="Select an Asset"
              />
            </div>

            {/* Column 1: Problem */}
            <div className="space-y-2">
              <label
                htmlFor="issue_description"
                className="block text-sm font-medium text-gray-700"
              >
                ปัญหา (Issue Description)
              </label>
              <InputTextarea
                id="issue_description"
                value={currentTicket?.issue_description || ""}
                onChange={(e) =>
                  setCurrentTicket({
                    ...currentTicket,
                    issue_description: e.target.value,
                  })
                }
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoResize
              />
              {currentTicket?.issue_attachment_path && (
                <div className="p-2 bg-gray-100 rounded-md border text-sm">
                  <p className="font-medium text-gray-600">ไฟล์แนบปัจจุบัน:</p>
                  <a
                    href={`${process.env.REACT_APP_API_URL.replace(
                      "/api",
                      ""
                    )}${currentTicket.issue_attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {currentTicket.issue_attachment_path.split("-").pop()}
                  </a>
                </div>
              )}
              <div>
                <label
                  htmlFor="issue_attachment"
                  className="block text-sm font-medium text-gray-500"
                >
                  {currentTicket?.issue_attachment_path
                    ? "เปลี่ยนไฟล์แนบ"
                    : "แนบไฟล์ปัญหา (ถ้ามี)"}
                </label>
                <input
                  type="file"
                  id="issue_attachment"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setIssueAttachment(e.target.files[0])}
                />
              </div>
            </div>

            {/* Column 2: Solution */}
            <div className="space-y-2">
              <label
                htmlFor="solution"
                className="block text-sm font-medium text-gray-700"
              >
                วิธีแก้ปัญหา (Solution)
              </label>
              <InputTextarea
                id="solution"
                value={currentTicket?.solution || ""}
                onChange={(e) =>
                  setCurrentTicket({
                    ...currentTicket,
                    solution: e.target.value,
                  })
                }
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoResize
              />
              {currentTicket?.solution_attachment_path && (
                <div className="p-2 bg-gray-100 rounded-md border text-sm">
                  <p className="font-medium text-gray-600">ไฟล์แนบปัจจุบัน:</p>
                  <a
                    href={`${process.env.REACT_APP_API_URL.replace(
                      "/api",
                      ""
                    )}${currentTicket.solution_attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {currentTicket.solution_attachment_path.split("-").pop()}
                  </a>
                </div>
              )}
              <div>
                <label
                  htmlFor="solution_attachment"
                  className="block text-sm font-medium text-gray-500"
                >
                  {currentTicket?.solution_attachment_path
                    ? "เปลี่ยนไฟล์แนบ"
                    : "แนบไฟล์วิธีแก้ (ถ้ามี)"}
                </label>
                <input
                  type="file"
                  id="solution_attachment"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  onChange={(e) => setSolutionAttachment(e.target.files[0])}
                />
              </div>
            </div>

            {/* Requester Info (Full Width) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown
                label="ชื่อผู้แจ้ง (Reported By)"
                idPrefix="sdd-employee"
                options={employees}
                value={currentTicket?.employee_id}
                onChange={(value) =>
                  setCurrentTicket({ ...currentTicket, employee_id: value })
                }
                placeholder="Select an Employee"
              />
              <div>
                <label
                  htmlFor="internal_phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  เบอร์ภายใน (4 หลัก)
                </label>
                <InputText
                  id="internal_phone"
                  value={currentTicket?.internal_phone || ""}
                  onChange={(e) =>
                    setCurrentTicket({
                      ...currentTicket,
                      internal_phone: e.target.value,
                    })
                  }
                  keyfilter="pint"
                  maxLength={4}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Handler Info (Full Width) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableDropdown
                label="ผู้ดำเนินการ (Handled By)"
                idPrefix="sdd-handler"
                options={users}
                value={currentTicket?.handled_by}
                onChange={(value) =>
                  setCurrentTicket({ ...currentTicket, handled_by: value })
                }
                placeholder="Select a User"
              />
              <SearchableDropdown
                label="ประเภทการซ่อม"
                idPrefix="sdd-repair"
                options={repairTypes}
                value={currentTicket?.repair_type}
                onChange={(value) =>
                  setCurrentTicket({ ...currentTicket, repair_type: value })
                }
                placeholder="Select Type"
              />
              <SearchableDropdown
                label="สถานะ"
                idPrefix="sdd-status"
                options={statuses.map((s) => ({ label: s, value: s }))}
                value={currentTicket?.status}
                onChange={(value) =>
                  setCurrentTicket({ ...currentTicket, status: value })
                }
                placeholder="Select Status"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ManageTicketsPage;
