import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ✨ 1. Import InputText และ KeyFilter เพิ่ม
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { KeyFilter } from "primereact/keyfilter";

import { FaEdit } from "react-icons/fa";

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
      console.error("Failed to fetch ticket history", error);
      toast.error("Failed to fetch ticket history.");
    } finally {
      setLoading(false);
    }
  }, [assetCode]);

  useEffect(() => {
    fetchHistory();
    // Fetch data for dropdowns in modal
    api
      .get("/assets?all=true")
      .then((res) =>
        setAssets(res.data.map((a) => ({ label: a.asset_name, value: a.id })))
      )
      .catch((err) => console.error("Failed to fetch assets", err));
    api
      .get("/employees")
      .then((res) =>
        setEmployees(res.data.map((e) => ({ label: e.name, value: e.id })))
      )
      .catch((err) => console.error("Failed to fetch employees", err));
    api
      .get("/users")
      .then((res) =>
        setUsers(res.data.map((u) => ({ label: u.username, value: u.id })))
      )
      .catch((err) => console.error("Failed to fetch users", err));
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
      fetchHistory(); // Re-fetch history
      hideDialog();
    } catch (error) {
      toast.error("Failed to save ticket.");
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severityMap = {
      Pending: "warning",
      "In Progress": "info",
      Completed: "success",
      Rejected: "danger",
    };
    return (
      <Tag value={rowData.status} severity={severityMap[rowData.status]} />
    );
  };

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.created_at).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        className="px-4 py-2 font-semibold text-sm bg-indigo-600 text-white border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
        autoFocus
      />
    </div>
  );

  if (loading)
    return <div className="text-center p-10">Loading history...</div>;

  return (
    <div className="my-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-700">
          Repair History
        </h2>
        <p className="mb-6 text-gray-500">
          For IT Asset:{" "}
          <span className="font-semibold text-gray-800">{assetCode}</span>
        </p>

        {tickets.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            {/* ✨ 1. เอา table-fixed ออกเพื่อให้ตารางยืดหยุ่น */}
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600">
                <tr>
                  {/* ✨ 2. เอา w-xx (width) ออกจาก th */}
                  <th className="p-3 font-semibold text-white">Reported Date</th>
                  <th className="p-3 font-semibold text-white">Reporter</th>
                  <th className="p-3 font-semibold text-white">Issue</th>
                  <th className="p-3 font-semibold text-white">Solution</th>
                  <th className="p-3 font-semibold text-white">Status</th>
                  <th className="p-3 font-semibold text-white">Handler</th>
                  <th className="p-3 font-semibold text-white text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    {/* ✨ 3. เอา whitespace-nowrap ออก */}
                    <td className="p-3 align-middle">
                      {new Date(ticket.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="p-3 align-middle">{ticket.Employee?.name || ticket.reporter_name || "N/A"}</td>
                    {/* ✨ 4. เพิ่ม style word-break เพื่อบังคับตัดคำ */}
                    <td className="p-3 align-middle" style={{ wordBreak: 'break-word' }}>{ticket.issue_description}</td>
                    <td className="p-3 align-middle" style={{ wordBreak: 'break-word' }}>{ticket.solution || "N/A"}</td>
                    <td className="p-3 align-middle">
                      <Tag 
                        value={ticket.status} 
                        severity={{ 'Pending': 'warning', 'In Progress': 'info', 'Completed': 'success', 'Rejected': 'danger' }[ticket.status]} 
                      />
                    </td>
                    <td className="p-3 align-middle">{ticket.handler?.username || "N/A"}</td>
                    <td className="p-3 align-middle text-center">
                      <button
                        onClick={() => editTicket(ticket)}
                        className="bg-blue-500 hover:bg-blue-600 table-action-button"
                        title="View/Update"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No repair history found for this device.
          </p>
        )}
      </div>

      <Dialog
        visible={dialogVisible}
        style={{ width: "50vw", maxWidth: "700px" }}
        footer={dialogFooter}
        onHide={hideDialog}
        className="shadow-xl"
        headerStyle={{ display: "none" }}
        contentStyle={{ padding: 0 }}
      >
        <div className="flex flex-col">
          <div className="px-6 py-4 border-b rounded-t-lg">
            <h3 className="text-xl font-semibold text-gray-800">Edit Ticket</h3>
          </div>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "65vh" }}>
            <div className="formgrid grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="field col-span-2">
                <label
                  htmlFor="asset_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Asset
                </label>
                <Dropdown
                  id="asset_id"
                  value={currentTicket?.asset_id}
                  options={assets}
                  onChange={(e) =>
                    setCurrentTicket({ ...currentTicket, asset_id: e.value })
                  }
                  placeholder="Select an Asset"
                  filter
                  className="w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="field col-span-2">
                <label
                  htmlFor="issue_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  autoResize
                />
              </div>
              <div className="field">
                <label
                  htmlFor="employee_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชื่อผู้แจ้ง (Reported By)
                </label>
                <Dropdown
                  id="employee_id"
                  value={currentTicket?.employee_id}
                  options={employees}
                  onChange={(e) =>
                    setCurrentTicket({ ...currentTicket, employee_id: e.value })
                  }
                  placeholder="Select an Employee"
                  filter
                  className="w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              {/* ✨ 3. เพิ่มช่องกรอก 'เบอร์ภายใน' ในฟอร์ม */}
              <div className="field">
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
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="field">
                <label
                  htmlFor="handled_by"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ผู้ดำเนินการ (Handled By)
                </label>
                <Dropdown
                  id="handled_by"
                  value={currentTicket?.handled_by}
                  options={users}
                  onChange={(e) =>
                    setCurrentTicket({ ...currentTicket, handled_by: e.value })
                  }
                  placeholder="Select a User"
                  filter
                  className="w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="field">
                <label
                  htmlFor="repair_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ประเภทการซ่อม
                </label>
                <Dropdown
                  id="repair_type"
                  value={currentTicket?.repair_type}
                  options={repairTypes}
                  onChange={(e) =>
                    setCurrentTicket({ ...currentTicket, repair_type: e.value })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="field">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  สถานะ
                </label>
                <Dropdown
                  id="status"
                  value={currentTicket?.status}
                  options={statuses}
                  onChange={(e) =>
                    setCurrentTicket({ ...currentTicket, status: e.value })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="field col-span-2">
                <label
                  htmlFor="solution"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  autoResize
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AssetTicketHistoryPage;
