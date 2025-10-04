// src/components/AssetList.js
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

// PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";

// Icon imports
import { FaLaptop, FaServer, FaHdd, FaBoxOpen } from "react-icons/fa";

const AssetIcon = ({ category }) => {
  const iconMap = {
    Notebook: <FaLaptop className="text-2xl text-blue-500" />,
    Server: <FaServer className="text-2xl text-gray-700" />,
    Storage: <FaHdd className="text-2xl text-green-500" />,
    default: <FaBoxOpen className="text-2xl text-gray-400" />,
  };
  return iconMap[category] || iconMap.default;
};

function AssetList({ assets, onDelete }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const dt = useRef(null);

  // --- UI Templates ---

  const rightToolbarTemplate = () => (
    <div className="relative w-full md:w-80">
      <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search assets..."
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
      />
    </div>
  );

  const pictureBodyTemplate = (rowData) => {
    return (
      <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-md">
        <AssetIcon category={rowData.category} />
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Link to={`/asset/${rowData.id}`}>
        <Button
          icon="pi pi-eye"
          tooltip="Detail"
          tooltipOptions={{ position: 'top' }}
          className="p-button-rounded p-button-info p-button-sm"
        />
      </Link>
      <Link to={`/asset/history/${rowData.asset_name}`}>
        <Button
          icon="pi pi-history"
          tooltip="History"
          tooltipOptions={{ position: 'top' }}
          className="p-button-rounded p-button-secondary p-button-sm"
        />
      </Link>
      <Button
        icon="pi pi-trash"
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => onDelete(rowData.id)}
      />
    </div>
  );

  return (
    <div className="card">
      <Toolbar
        className="mb-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        right={rightToolbarTemplate}
      ></Toolbar>

      <div className="overflow-x-auto">
        <DataTable
          ref={dt}
          value={assets}
          dataKey="id"
          paginator
          rows={10}
          size="small"
          rowHover
          showGridlines
          globalFilter={globalFilter}
          emptyMessage="No assets found."
          className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
        >
          <Column
            header="Picture"
            body={pictureBodyTemplate}
            style={{ width: "100px", textAlign: 'center' }}
            headerClassName="text-xs"
          />
          <Column
            field="category"
            header="Category"
            sortable
            style={{ minWidth: "100px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
          <Column
            field="asset_name"
            header="Asset Name"
            sortable
            style={{ minWidth: "100px" }}
            bodyClassName="text-gray-800 text-xs font-medium"
            headerClassName="text-xs"
          />
          <Column
            field="subcategory"
            header="Subcategory"
            sortable
            style={{ minWidth: "100px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
          <Column
            field="department"
            header="Department"
            sortable
            style={{ minWidth: "150px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
          <Column
            field="user_name"
            header="Device User"
            sortable
            style={{ minWidth: "150px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
          <Column
            field="user_id"
            header="User ID"
            sortable
            style={{ minWidth: "100px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
            bodyClassName="text-gray-800 text-xs"
            headerClassName="text-xs"
          />
        </DataTable>
      </div>
    </div>
  );
}

export default AssetList;