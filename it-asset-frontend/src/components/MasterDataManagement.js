// src/components/MasterDataManagement.js

import React, { useState, useEffect, useRef } from "react";
import axios from "../api";
import { toast } from "react-toastify";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";

import SearchableDropdown from "./SearchableDropdown";

const MasterDataManagement = ({ apiEndpoint, title, dataColumns }) => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/${apiEndpoint}`);
      setData(response.data);
    } catch (error) {
      toast.error(`Failed to fetch ${title}.`);
    }
  };

  const handleInputChange = (valueOrEvent, name) => {
    const val =
      valueOrEvent && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;
    setFormData({ ...formData, [name]: val || "" });
  };

  const handleSubmit = async () => {
    try {
      if (currentItem) {
        await axios.put(`/${apiEndpoint}/${currentItem.id}`, formData);
        toast.success(`${title} updated successfully!`);
      } else {
        await axios.post(`/${apiEndpoint}`, formData);
        toast.success(`${title} added successfully!`);
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(`Failed to save ${title}.`);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/${apiEndpoint}/${item.id}`);
        toast.success(`${title} deleted successfully!`);
        fetchData();
      } catch (error) {
        toast.error(`Failed to delete ${title}.`);
      }
    }
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    const initialFormData = dataColumns.reduce((acc, col) => {
      acc[col.key] = item && item[col.key] ? item[col.key] : "";
      return acc;
    }, {});
    setFormData(item ? { ...initialFormData, ...item } : initialFormData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
        onClick={() => openModal(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        tooltip="Delete"
        tooltipOptions={{ position: "top" }}
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const exportCSV = () => dt.current.exportCSV();

  const leftToolbarTemplate = () => (
    <Button
      label="Add New"
      icon="pi pi-plus"
      className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 text-sm rounded-lg font-semibold shadow hover:opacity-90"
      onClick={() => openModal()}
    />
  );

  const rightToolbarTemplate = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
        />
      </div>
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-sm p-button-outlined p-button-secondary"
        onClick={exportCSV}
      />
    </div>
  );

  const modalFooter = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-lg">
      <Button
        label="Cancel"
        onClick={closeModal}
        className="px-4 py-2 font-semibold text-sm bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      />
      <Button
        label="Save"
        onClick={handleSubmit}
        className="bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white px-4 py-2 rounded-md font-semibold shadow hover:opacity-90"
        autoFocus
      />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        {`Manage ${title}`}
      </h1>

      <Toolbar
        className="mb-4 p-2"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      ></Toolbar>

      <DataTable
        ref={dt}
        value={data}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        dataKey="id"
        size="small"
        stripedRows
        showGridlines
        globalFilter={globalFilter}
        globalFilterFields={dataColumns.map((col) => col.key)}
        emptyMessage={`No ${title} found.`}
        className="datatable-hover-effect text-sm text-gray-800" // ✨ [ปรับแก้] เพิ่มสีตัวอักษรหลัก
      >
        {dataColumns.map((col) => (
          <Column
            key={col.key}
            field={col.key}
            header={col.name}
            sortable
            style={{ minWidth: "12rem" }}
            bodyClassName="text-gray-800" // ✨ [ปรับแก้] เพิ่มสีตัวอักษรใน Cell
            headerClassName="text-sm text-gray-800 font-semibold" // ✨ [ปรับแก้] เพิ่มสไตล์ให้ Header
          />
        ))}
        <Column
          body={actionBodyTemplate}
          style={{ width: "8rem", textAlign: "center" }}
          header="Actions"
          headerClassName="text-sm text-gray-800 font-semibold" // ✨ [ปรับแก้] เพิ่มสไตล์ให้ Header
        />
      </DataTable>

      <Dialog
        visible={isModalOpen}
        style={{ width: "450px" }}
        footer={modalFooter}
        onHide={closeModal}
        className="shadow-xl rounded-xl overflow-hidden"
        headerStyle={{ display: "none" }}
        contentStyle={{ padding: 0 }}
      >
        <div className="flex flex-col">
          <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] text-white rounded-t-xl">
            <h3 className="text-lg font-semibold">
              {currentItem ? `Edit ${title}` : `Add New ${title}`}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {dataColumns.map((col) => (
              <div key={col.key}>
                <label
                  htmlFor={col.key}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {col.name}
                </label>

                {col.type === "dropdown" ? (
                  <SearchableDropdown
                    idPrefix={`sdd-${col.key}`}
                    options={col.options || []}
                    value={formData[col.key] || ""}
                    onChange={(value) => handleInputChange(value, col.key)}
                    placeholder={`Select ${col.name}`}
                  />
                ) : (
                  <InputText
                    id={col.key}
                    value={formData[col.key] || ""}
                    onChange={(e) => handleInputChange(e, col.key)}
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm"
                    required
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MasterDataManagement;