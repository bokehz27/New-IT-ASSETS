import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import api from "../api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// PrimeReact Components
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";

import SearchableDropdown from "../components/SearchableDropdown";

import { Clock, Loader2, CheckCircle2, XCircle, X } from "lucide-react";

function AssetTicketHistoryPage() {
  const { assetCode } = useParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [allEmployeesData, setAllEmployeesData] = useState([]);
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");

  const [issueAttachment, setIssueAttachment] = useState(null);
  const [solutionAttachment, setSolutionAttachment] = useState(null);

  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState(null);

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

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/asset/${assetCode}`);
      setTickets(res.data);
    } catch (error) {
      toast.error("Failed to fetch ticket history.");
    } finally {
      setLoading(false);
    }
  }, [assetCode]);

  useEffect(() => {
    fetchHistory();

    api
      .get("/assets?all=true")
      .then((res) =>
        setAssets(res.data.map((a) => ({ label: a.asset_name, value: a.id })))
      )
      .catch((err) => console.error("Failed to fetch assets", err));

    api
      .get("/employees")
      .then((res) => {
        setAllEmployeesData(res.data);
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id })));
      })
      .catch((err) => console.error("Failed to fetch employees", err));

    api
      .get("/users")
      .then((res) =>
        setUsers(res.data.map((u) => ({ label: u.username, value: u.id })))
      )
      .catch((err) => console.error("Failed to fetch users", err));
  }, [fetchHistory]);

  // อัปเดต Email ปัจจุบันเมื่อเปิด ticket
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

  const editTicket = (ticket) => {
    setCurrentTicket({ ...ticket });
    setIssueAttachment(null);
    setSolutionAttachment(null);

    if (ticket.employee_id && allEmployeesData.length > 0) {
      const selectedEmp = allEmployeesData.find(
        (e) => e.id === ticket.employee_id
      );
      if (selectedEmp && selectedEmp.Email) {
        setSelectedEmployeeEmail(selectedEmp.Email.email);
      } else {
        setSelectedEmployeeEmail("");
      }
    } else {
      setSelectedEmployeeEmail("");
    }

    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setCurrentTicket(null);
    setIssueAttachment(null);
    setSolutionAttachment(null);
    setSelectedEmployeeEmail("");
  };

  const saveTicket = async () => {
    if (!currentTicket?.id) return;

    const formData = new FormData();

    // ใส่ข้อมูล ticket ทั้งหมดลงใน formData
    for (const key in currentTicket) {
      if (
        currentTicket[key] !== null &&
        currentTicket[key] !== undefined &&
        key !== "Employee" &&
        key !== "Asset" &&
        key !== "handler" // ตัด relationship object ออก
      ) {
        formData.append(key, currentTicket[key]);
      }
    }

    if (issueAttachment) {
      formData.append("issue_attachment", issueAttachment);
    }
    if (solutionAttachment) {
      formData.append("solution_attachment", solutionAttachment);
    }

    try {
      await api.put(`/tickets/${currentTicket.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ticket updated successfully!");
      fetchHistory();
      hideDialog();
    } catch (error) {
      toast.error("Failed to save ticket.");
    }
  };

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
    <div className="flex justify-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        onClick={() => editTicket(rowData)}
      />
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
        label="Save"
        onClick={saveTicket}
        className="bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white px-4 py-2 rounded-md font-semibold shadow hover:opacity-90"
      />
    </div>
  );

  const inputClassName =
    "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm";

  // --- นับจำนวน ticket แต่ละสถานะ ---
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
  }, [tickets]);

  // --- กรองตาม status & date range ---
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    const [startDate, endDate] = dateRange || [null, null];
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= startDate && ticketDate <= endOfDay;
      });
    }

    return filtered;
  }, [tickets, statusFilter, dateRange]);

  // --- StatusSummary เหมือน ManageTicketsPage ---
  const StatusSummary = () => {
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
              className={`
                flex items-center gap-2 pl-3 pr-2 py-1.5 
                border rounded-full text-xs font-semibold tracking-wide 
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isActive ? styles.active : styles.base}
              `}
            >
              {icon && <span>{icon}</span>}
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

  const leftToolbarTemplate = () => (
    <div className="flex flex-col md:flex-row items-center gap-2">
      {/* หน้า History นี้ไม่สร้าง Ticket ใหม่เลยปล่อยว่าง / ใส่ข้อความเฉย ๆ ก็ได้ */}
      <span className="text-sm text-gray-600">
        Showing repair history for this asset
      </span>
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex flex-col md:flex-row items-center gap-2">
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

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
        Repair History
      </h1>
      <p className="mt-1 text-slate-500">
        For IT Asset:{" "}
        <span className="font-semibold text-slate-800">{assetCode}</span>
      </p>


      {/* Toolbar filter + search */}
      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <div className="mt-2">
        {filteredTickets.length > 0 ? (
          <DataTable
            ref={dt}
            value={filteredTickets}
            loading={loading}
            dataKey="id"
            paginator
            rows={10}
            size="small"
            rowHover
            showGridlines
            globalFilter={globalFilter}
            emptyMessage="No history found."
            className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
          >
            <Column
              header="Request Date"
              body={dateBodyTemplate}
              sortable
              sortField="created_at"
              style={{ width: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Reporter"
              field="Employee.name"
              sortable
              style={{ minWidth: "150px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Problem"
              field="issue_description"
              body={issueBodyTemplate}
              bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
              style={{ minWidth: "250px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Solution"
              field="solution"
              body={solutionBodyTemplate}
              bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
              style={{ minWidth: "250px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Status"
              body={statusBodyTemplate}
              sortable
              field="status"
              style={{ width: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Handler"
              field="handler.username"
              sortable
              style={{ minWidth: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: "100px", textAlign: "center" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-gray-800"
            />
          </DataTable>
        ) : (
          <div className="text-center text-slate-500 py-10 bg-white border border-slate-200 rounded-xl">
            <p>No repair history found for this device.</p>
          </div>
        )}
      </div>

      {/* Dialog ฟอร์มแบบเดียวกับ ManageTicketsPage / TicketFormModal style */}
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
              {currentTicket?.id ? "Edit Ticket" : "Ticket Detail"}
            </h3>
          </div>

          {/* BODY: Sections */}
          <div className="p-6 space-y-6">
            {/* Asset Detail */}
            <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                Asset Detail
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableDropdown
                  label="Asset"
                  idPrefix="sdd-asset"
                  options={assets}
                  value={currentTicket?.asset_id}
                  onChange={(v) =>
                    setCurrentTicket({ ...currentTicket, asset_id: v })
                  }
                  placeholder="Select Asset"
                />
                <SearchableDropdown
                  label="Repair Type"
                  idPrefix="sdd-repair"
                  options={repairTypes}
                  value={currentTicket?.repair_type}
                  onChange={(v) =>
                    setCurrentTicket({ ...currentTicket, repair_type: v })
                  }
                  placeholder="Select Repair Type"
                />
              </div>
            </section>

            {/* Issue & Solution */}
            <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                Issue Details & Solution
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Issue */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Issue Description
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
                    className={inputClassName}
                    autoResize
                  />
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Attach Issue File (optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setIssueAttachment(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-gray-600 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Solution */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Solution
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
                    className={inputClassName}
                    autoResize
                  />
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Attach Solution File (optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setSolutionAttachment(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-gray-600 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Requester Information */}
            <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                Requester Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SearchableDropdown
                  label="Reporter (Reported By)"
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
                  placeholder="Select Reporter"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Email
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
                      Corrected Email
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
                      If a new email was provided by the requester, it will be
                      shown here.
                    </small>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Phone (4 digits)
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

            {/* Handler Information */}
            <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                Handler Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SearchableDropdown
                  label="Handled By"
                  idPrefix="sdd-handler"
                  options={users}
                  value={currentTicket?.handled_by}
                  onChange={(v) =>
                    setCurrentTicket({ ...currentTicket, handled_by: v })
                  }
                  placeholder="Select Handler"
                />
                <SearchableDropdown
                  label="Status"
                  idPrefix="sdd-status"
                  options={statuses.map((s) => ({ label: s, value: s }))}
                  value={currentTicket?.status}
                  onChange={(v) =>
                    setCurrentTicket({ ...currentTicket, status: v })
                  }
                  placeholder="Select Status"
                />
              </div>
            </section>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AssetTicketHistoryPage;
