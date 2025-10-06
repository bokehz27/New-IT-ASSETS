import React, { useState, useEffect, useCallback } from "react";
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
import SearchableDropdown from "../components/SearchableDropdown";

import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

function AssetTicketHistoryPage() {
  const { assetCode } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  const repairTypes = ["Hardware", "Software", "Network", "Other"];
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
      );
    api
      .get("/employees")
      .then((res) =>
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id })))
      );
    api
      .get("/users")
      .then((res) =>
        setUsers(res.data.map((u) => ({ label: u.username, value: u.id })))
      );
  }, [fetchHistory]);

  const editTicket = (ticket) => {
    setCurrentTicket({ ...ticket });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setCurrentTicket(null);
  };

  const saveTicket = async () => {
    try {
      if (currentTicket.id) {
        await api.put(`/tickets/${currentTicket.id}`, currentTicket);
        toast.success("Ticket updated successfully!");
      }
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

  // --- ✨ 1. แก้ไข dateBodyTemplate ให้แสดงเวลาด้วย ---
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
      hour12: false,
    });
    return (
      <div>
        <span>{formattedDate}</span>
        <br />
        <span className="text-slate-500 text-xs">{formattedTime}</span>
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
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t rounded-b-lg">
      <Button
        label="Cancel"
        onClick={hideDialog}
        className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50"
      />
      <Button
        label="Save"
        onClick={saveTicket}
        className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
        autoFocus
      />
    </div>
  );

  const inputClassName =
    "w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm";

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
        Repair History
      </h1>
      <p className="mt-1 text-slate-500">
        For IT Asset:{" "}
        <span className="font-semibold text-slate-800">{assetCode}</span>
      </p>

      <div className="mt-6">
        {tickets.length > 0 ? (
          // --- ✨ 2. แก้ไข bodyClassName ของทุก Column ---
          <DataTable
            value={tickets}
            loading={loading}
            dataKey="id"
            paginator
            rows={10}
            size="small"
            rowHover
            showGridlines
            emptyMessage="No history found."
            className="shadow-md rounded-lg overflow-hidden border border-slate-200"
          >
            <Column
              header="Reported Date"
              body={dateBodyTemplate}
              sortable
              field="created_at"
              style={{ width: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Reporter"
              field="Employee.name"
              sortable
              style={{ minWidth: "150px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Issue"
              field="issue_description"
              bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
              style={{ minWidth: "250px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Solution"
              field="solution"
              bodyStyle={{ whiteSpace: "normal", wordBreak: "break-word" }}
              style={{ minWidth: "250px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Status"
              body={statusBodyTemplate}
              sortable
              field="status"
              style={{ width: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Handler"
              field="handler.username"
              sortable
              style={{ minWidth: "120px" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: "100px", textAlign: "center" }}
              headerClassName="text-sm"
              bodyClassName="text-sm text-slate-800"
            />
          </DataTable>
        ) : (
          <div className="text-center text-slate-500 py-10 bg-white border border-slate-200 rounded-xl">
            <p>No repair history found for this device.</p>
          </div>
        )}
      </div>

      <Dialog
        visible={dialogVisible}
        style={{ width: "60vw", maxWidth: "900px" }}
        footer={dialogFooter}
        onHide={hideDialog}
        className="shadow-xl rounded-xl overflow-hidden"
        headerStyle={{ display: "none" }}
        contentStyle={{ padding: 0 }}
      >
        <div className="flex flex-col">
          <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
            <h3 className="text-lg font-semibold">Edit Ticket</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <SearchableDropdown
                label="Asset"
                idPrefix="dlg-asset"
                options={assets}
                value={currentTicket?.asset_id}
                onChange={(v) =>
                  setCurrentTicket({ ...currentTicket, asset_id: v })
                }
                placeholder="Select an Asset"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                rows={4}
                className={inputClassName}
                autoResize
              />
            </div>
            <div>
              <SearchableDropdown
                label="Reported By"
                idPrefix="dlg-employee"
                options={employees}
                value={currentTicket?.employee_id}
                onChange={(v) =>
                  setCurrentTicket({ ...currentTicket, employee_id: v })
                }
                placeholder="Select an Employee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Internal Phone
              </label>
              <InputText
                value={currentTicket?.internal_phone || ""}
                onChange={(e) =>
                  setCurrentTicket({
                    ...currentTicket,
                    internal_phone: e.target.value,
                  })
                }
                keyfilter="pint"
                maxLength={4}
                className={inputClassName}
              />
            </div>
            <div>
              <SearchableDropdown
                label="Handled By"
                idPrefix="dlg-handler"
                options={users}
                value={currentTicket?.handled_by}
                onChange={(v) =>
                  setCurrentTicket({ ...currentTicket, handled_by: v })
                }
                placeholder="Select a User"
              />
            </div>
            <div>
              <SearchableDropdown
                label="Repair Type"
                idPrefix="dlg-repair"
                options={repairTypes.map((t) => ({ label: t, value: t }))}
                value={currentTicket?.repair_type}
                onChange={(v) =>
                  setCurrentTicket({ ...currentTicket, repair_type: v })
                }
              />
            </div>
            <div>
              <SearchableDropdown
                label="Status"
                idPrefix="dlg-status"
                options={statuses.map((s) => ({ label: s, value: s }))}
                value={currentTicket?.status}
                onChange={(v) =>
                  setCurrentTicket({ ...currentTicket, status: v })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
                rows={4}
                className={inputClassName}
                autoResize
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AssetTicketHistoryPage;
