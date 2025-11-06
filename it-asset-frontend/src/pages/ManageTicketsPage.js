import React, { useState, useEffect, useRef, useMemo } from "react"; // <-- เพิ่ม useMemo
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
import { Calendar } from "primereact/calendar"; // <-- เพิ่ม Calendar
import SearchableDropdown from "../components/SearchableDropdown";
import {
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  CalendarIcon,
  X,
} from "lucide-react"; // <-- เพิ่มไอคอน

const ManageTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [allEmployeesData, setAllEmployeesData] = useState([]);
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");

  // --- ✨ State ใหม่สำหรับ Filter ---
  const [statusFilter, setStatusFilter] = useState("All"); // ค่าเริ่มต้นคือ 'All'
  const [dateRange, setDateRange] = useState(null); // เก็บ array [startDate, endDate]

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
      .then((res) => {
        setAllEmployeesData(res.data); // เก็บข้อมูลทั้งหมด (ที่มี Email object)
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id }))); // สร้าง dropdown options
      })
      .catch((err) => console.error("Failed to fetch employees", err));

    axios
      .get("/users")
      .then((res) =>
        setUsers(res.data.map((u) => ({ label: u.username, value: u.id })))
      )
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  // ✅ เมื่อโหลด employees เสร็จ หรือมีการเปลี่ยน ticket ปัจจุบัน
  useEffect(() => {
    if (
      currentTicket &&
      currentTicket.employee_id &&
      allEmployeesData.length > 0
    ) {
      const selectedEmp = allEmployeesData.find(
        (e) => e.id === currentTicket.employee_id
      );
      if (selectedEmp && selectedEmp.Email) {
        setSelectedEmployeeEmail(selectedEmp.Email.email);
      } else {
        setSelectedEmployeeEmail("");
      }
    }
  }, [currentTicket, allEmployeesData]);

  const fetchTickets = async () => {
    // <--- ต้องมี { ตรงนี้
    try {
      const response = await axios.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to fetch tickets.");
    }
  };
  // --- ✨ [ส่วนที่เพิ่มใหม่] Logic การนับจำนวนและกรองข้อมูล ---

  // 1. นับจำนวน Ticket ในแต่ละสถานะ (ใช้ useMemo เพื่อไม่ให้คำนวณใหม่ทุกครั้งที่ re-render)
  const statusCounts = useMemo(() => {
    const counts = {
      All: tickets.length,
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Rejected: 0,
    };
    for (const ticket of tickets) {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status]++;
      }
    }
    return counts;
  }, [tickets]); // จะคำนวณใหม่เมื่อ 'tickets' เปลี่ยนแปลงเท่านั้น

  // 2. กรอง Ticket ตาม status และ date range ที่เลือก
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // กรองตามสถานะ
    if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // กรองตามช่วงวันที่
    const [startDate, endDate] = dateRange || [null, null];
    if (startDate && endDate) {
      // ตั้งเวลาของวันสิ้นสุดให้เป็นท้ายสุดของวัน (23:59:59) เพื่อให้รวมข้อมูลของวันนั้นด้วย
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= startDate && ticketDate <= endOfDay;
      });
    }

    return filtered;
  }, [tickets, statusFilter, dateRange]); // จะคำนวณใหม่เมื่อค่าใดค่าหนึ่งเปลี่ยนแปลง

  const openNew = () => {
    setCurrentTicket({ status: "Pending", repair_type: "Other" });
    setIssueAttachment(null);
    setSolutionAttachment(null);
    setSelectedEmployeeEmail("");
    setDialogVisible(true);
  };

  const editTicket = (ticket) => {
    setCurrentTicket({ ...ticket });
    setIssueAttachment(null);
    setSolutionAttachment(null);

    // ✨ [เพิ่ม] ค้นหาและตั้งค่าอีเมลสำหรับ ticket ที่มีอยู่
    if (ticket.employee_id) {
      // (เราจะใช้ allEmployeesData ที่ fetch มาตอนโหลดหน้า)
      const selectedEmp = allEmployeesData.find(
        (e) => e.id === ticket.employee_id
      );
      if (selectedEmp && selectedEmp.Email) {
        setSelectedEmployeeEmail(selectedEmp.Email.email);
      } else {
        setSelectedEmployeeEmail(""); // ไม่พบ (อาจเป็นพนักงานเก่า)
      }
    } else {
      setSelectedEmployeeEmail("");
    }

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
    <div className="flex flex-col md:flex-row items-center gap-2">
      <Button
        label="New Ticket"
        icon="pi pi-plus"
        onClick={openNew}
        className="luxury-gradient-btn text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:opacity-90 transition-all"
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex flex-col md:flex-row items-center gap-2">
      {/* --- ส่วนของปฏิทินที่ย้ายมา --- */}
      <div className="flex items-center gap-2 p-fluid">
        <Calendar
          value={dateRange}
          onChange={(e) => setDateRange(e.value)}
          selectionMode="range"
          readOnlyInput
          placeholder="Select a date range"
          dateFormat="dd/mm/yy"
          showIcon
          className="text-sm"
        />
        {dateRange && dateRange[0] && (
          <Button
            icon={<X size={14} />}
            className="p-button-secondary p-button-sm"
            onClick={() => setDateRange(null)}
            tooltip="Clear Date Filter"
          />
        )}
      </div>

      {/* --- ช่องค้นหาเดิม --- */}
      <div className="relative w-full md:w-80">
        <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search tickets..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
        />
      </div>
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

  // --- ✨ [ส่วนที่เพิ่มใหม่] UI Component สำหรับปุ่มสถานะ ---
  const StatusSummary = () => {
    // กำหนดลำดับและข้อมูลสำหรับแต่ละสถานะ
    const statusConfig = [
      { name: "All", icon: null, color: "gray" },
      { name: "Pending", icon: <Clock size={12} />, color: "yellow" },
      {
        name: "In Progress",
        icon: <Loader2 size={12} className="animate-spin" />,
        color: "blue",
      },
      { name: "Completed", icon: <CheckCircle2 size={12} />, color: "green" },
      { name: "Rejected", icon: <XCircle size={12} />, color: "red" },
    ];

    // Object สำหรับเก็บ CSS classes ของแต่ละสี
    const colorStyles = {
      gray: {
        base: "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        active: "bg-gray-800 text-white border-gray-800",
        countBg: "bg-gray-100",
        countText: "text-gray-600",
        activeCountBg: "bg-white/25",
        activeCountText: "text-white",
      },
      yellow: {
        base: "border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
        active: "bg-yellow-500 text-white border-yellow-500",
        countBg: "bg-yellow-200/50",
        countText: "text-yellow-900",
        activeCountBg: "bg-white/25",
        activeCountText: "text-white",
      },
      blue: {
        base: "border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100",
        active: "bg-blue-600 text-white border-blue-600",
        countBg: "bg-blue-200/50",
        countText: "text-blue-900",
        activeCountBg: "bg-white/25",
        activeCountText: "text-white",
      },
      green: {
        base: "border-green-400 bg-green-50 text-green-800 hover:bg-green-100",
        active: "bg-green-600 text-white border-green-600",
        countBg: "bg-green-200/50",
        countText: "text-green-900",
        activeCountBg: "bg-white/25",
        activeCountText: "text-white",
      },
      red: {
        base: "border-red-400 bg-red-50 text-red-800 hover:bg-red-100",
        active: "bg-red-600 text-white border-red-600",
        countBg: "bg-red-200/50",
        countText: "text-red-900",
        activeCountBg: "bg-white/25",
        activeCountText: "text-white",
      },
    };

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusConfig.map(({ name, icon, color }) => {
          const isActive = statusFilter === name;
          const styles = colorStyles[color];

          return (
            <button
              key={name}
              onClick={() => setStatusFilter(name)}
              // ✨ ปรับปรุง className ทั้งหมด
              className={`
                flex items-center gap-2 pl-3 pr-2 py-1.5 
                border rounded-full text-xs font-semibold tracking-wide 
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isActive ? styles.active : styles.base}
              `}
            >
              {icon && <span className="mr-0">{icon}</span>}
              <span className="leading-none">{name}</span>
              <span
                className={`
                  flex items-center justify-center 
                  min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                  transition-colors duration-200
                  ${
                    isActive
                      ? `${styles.activeCountBg} ${styles.activeCountText}`
                      : `${styles.countBg} ${styles.countText}`
                  }
                `}
              >
                {statusCounts[name]}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        Manage Tickets
      </h1>

      {/* ✨ [ส่วนที่เพิ่มใหม่] แสดง StatusSummary ที่นี่ */}
      <StatusSummary />

      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      ></Toolbar>

      <div className="overflow-x-auto">
        <DataTable
          ref={dt}
          // ✨ เปลี่ยน value จาก 'tickets' เป็น 'filteredTickets'
          value={filteredTickets}
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
  style={{ width: "70vw", maxWidth: "1000px" }}
  footer={dialogFooter}
  onHide={hideDialog}
  className="shadow-2xl rounded-xl overflow-hidden"
  headerStyle={{ display: "none" }}
  contentStyle={{ padding: 0 }}
>
  <div className="flex flex-col rounded-xl overflow-hidden bg-gray-50">
    {/* Header */}
    <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white rounded-t-xl shadow">
      <h3 className="text-lg font-semibold tracking-wide">
        {currentTicket?.id ? "Edit Ticket" : "Create New Ticket"}
      </h3>
    </div>

    {/* ==================== Section: Asset ==================== */}
    <div className="p-6 space-y-6">
      <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
          ข้อมูลอุปกรณ์ (Asset)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableDropdown
            label="อุปกรณ์ (Asset)"
            idPrefix="sdd-asset"
            options={assets}
            value={currentTicket?.asset_id}
            onChange={(v) =>
              setCurrentTicket({ ...currentTicket, asset_id: v })
            }
            placeholder="เลือกอุปกรณ์"
          />
          <SearchableDropdown
            label="ประเภทการซ่อม"
            idPrefix="sdd-repair"
            options={repairTypes}
            value={currentTicket?.repair_type}
            onChange={(v) =>
              setCurrentTicket({ ...currentTicket, repair_type: v })
            }
            placeholder="เลือกประเภท"
          />
        </div>
      </section>

      {/* ==================== Section: Issue / Solution ==================== */}
      <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
          รายละเอียดปัญหาและวิธีแก้
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ปัญหา */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              ปัญหา (Issue Description)
            </label>
            <InputTextarea
              value={currentTicket?.issue_description || ""}
              onChange={(e) =>
                setCurrentTicket({
                  ...currentTicket,
                  issue_description: e.target.value,
                })
              }
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              autoResize
            />
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                แนบไฟล์ปัญหา (ถ้ามี)
              </label>
              <input
                type="file"
                onChange={(e) => setIssueAttachment(e.target.files[0])}
                className="block w-full text-sm text-gray-600 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* วิธีแก้ */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              วิธีแก้ปัญหา (Solution)
            </label>
            <InputTextarea
              value={currentTicket?.solution || ""}
              onChange={(e) =>
                setCurrentTicket({
                  ...currentTicket,
                  solution: e.target.value,
                })
              }
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
              autoResize
            />
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                แนบไฟล์วิธีแก้ (ถ้ามี)
              </label>
              <input
                type="file"
                onChange={(e) => setSolutionAttachment(e.target.files[0])}
                className="block w-full text-sm text-gray-600 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Section: Reporter ==================== */}
      <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
          ข้อมูลผู้แจ้ง (Requester)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SearchableDropdown
            label="ชื่อผู้แจ้ง (Reported By)"
            idPrefix="sdd-employee"
            options={employees}
            value={currentTicket?.employee_id}
            onChange={(value) => {
              setCurrentTicket({ ...currentTicket, employee_id: value });
              const selectedEmp = allEmployeesData.find(
                (e) => e.id === value
              );
              if (selectedEmp && selectedEmp.Email) {
                setSelectedEmployeeEmail(selectedEmp.Email.email);
              } else {
                setSelectedEmployeeEmail("");
              }
            }}
            placeholder="เลือกผู้แจ้ง"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ปัจจุบัน
            </label>
            <InputText
              value={
                selectedEmployeeEmail ||
                currentTicket?.Employee?.Email?.email ||
                ""
              }
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            />
          </div>

          {currentTicket?.id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมลที่แก้ไข (Corrected Email)
              </label>
              <InputText
                type="email"
                value={currentTicket?.corrected_email || ""}
                onChange={(e) =>
                  setCurrentTicket({
                    ...currentTicket,
                    corrected_email: e.target.value,
                  })
                }
                placeholder=""
                className="w-full p-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              />
              <small className="text-xs text-gray-500">
                ถ้ามีการกรอกอีเมลใหม่จากผู้แจ้ง ระบบจะแสดงที่นี่
              </small>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์ภายใน (4 หลัก)
            </label>
            <InputText
              value={currentTicket?.internal_phone || ""}
              onChange={(e) =>
                setCurrentTicket({
                  ...currentTicket,
                  internal_phone: e.target.value,
                })
              }
              maxLength={4}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
        </div>
      </section>

      {/* ==================== Section: Handler ==================== */}
      <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
          การดำเนินการ (Handler Info)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SearchableDropdown
            label="ผู้ดำเนินการ (Handled By)"
            idPrefix="sdd-handler"
            options={users}
            value={currentTicket?.handled_by}
            onChange={(v) =>
              setCurrentTicket({ ...currentTicket, handled_by: v })
            }
            placeholder="เลือกผู้ดำเนินการ"
          />
          <SearchableDropdown
            label="สถานะ (Status)"
            idPrefix="sdd-status"
            options={statuses.map((s) => ({ label: s, value: s }))}
            value={currentTicket?.status}
            onChange={(v) =>
              setCurrentTicket({ ...currentTicket, status: v })
            }
            placeholder="เลือกสถานะ"
          />
        </div>
      </section>
    </div>
  </div>
</Dialog>

    </div>
  );
};

export default ManageTicketsPage;
