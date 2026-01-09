// src/pages/AssetListPage.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";

// PrimeReact Components
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";

// Icons
import { FaLaptop, FaServer, FaHdd, FaBoxOpen } from "react-icons/fa";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  List,
  Building,
  Layers,
} from "lucide-react";

const AssetIcon = ({ category }) => {
  const iconMap = {
    Notebook: <FaLaptop className="text-2xl text-blue-500" />,
    Server: <FaServer className="text-2xl text-gray-700" />,
    Storage: <FaHdd className="text-2xl text-green-500" />,
    default: <FaBoxOpen className="text-2xl text-gray-400" />,
  };
  return iconMap[category] || iconMap.default;
};

// ✨ [ปรับปรุง] Component สำหรับปุ่มฟิลเตอร์สไตล์ใหม่
const FilterSummaryButtons = ({
  data,
  activeFilter,
  onFilterChange,
  config,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {Object.entries(data)
        .sort((a, b) => {
          if (a[0] === "All") return -1;
          if (b[0] === "All") return 1;
          return a[0].localeCompare(b[0]);
        })
        .map(([name, count]) => {
          const isAllButton = name === "All";
          const isActive = activeFilter === name;
          const currentConfig = isAllButton
            ? config.All
            : config[name] || config.Default;
          const styles = currentConfig.styles;
          const Icon = currentConfig.icon;

          return (
            <button
              key={name}
              onClick={() => onFilterChange(name)}
              className={`
                flex items-center gap-2 pl-3 pr-2 py-1.5 
                border rounded-full text-xs font-semibold tracking-wide 
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isActive ? styles.active : styles.base}
              `}
            >
              {Icon && <Icon size={12} className="mr-0" />}
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
                {count}
              </span>
            </button>
          );
        })}
    </div>
  );
};

function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const dt = useRef(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/assets?all=true");
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to fetch assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { All: assets.length };
    assets.forEach((a) => {
      const key = a.status || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const categoryCounts = useMemo(() => {
    const counts = { All: assets.length };
    assets.forEach((a) => {
      const key = a.category || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const departmentCounts = useMemo(() => {
    const counts = { All: assets.length };
    assets.forEach((a) => {
      const key = a.department || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const sOk = statusFilter === "All" || a.status === statusFilter;
        const cOk = categoryFilter === "All" || a.category === categoryFilter;
        const dOk =
          departmentFilter === "All" || a.department === departmentFilter;
        return sOk && cOk && dOk;
      })
      .sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date) : 0;
        const dateB = b.start_date ? new Date(b.start_date) : 0;
        return dateB - dateA; // ⬅ เรียงใหม่ล่าสุดก่อน
      });
  }, [assets, statusFilter, categoryFilter, departmentFilter]);

  const leftToolbarTemplate = () => (
    <Link to="/add">
      <Button
        label="New Asset"
        icon="pi pi-plus"
        className="luxury-gradient-btn text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md hover:opacity-90 transition-all"
      />
    </Link>
  );

  const rightToolbarTemplate = () => (
    <div className="relative w-full md:w-80">
      <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <InputText
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value.trim())}
        placeholder="Search assets..."
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
      />
    </div>
  );

  const pictureBodyTemplate = (rowData) => (
    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-md">
      <AssetIcon category={rowData.category} />
    </div>
  );

  // ✨ [ปรับปรุง] Template สำหรับ Status ให้เหมือนหน้า Ticket
  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      Enable: {
        Icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-50",
        text: "Enable",
      },
      Disable: {
        Icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-50",
        text: "Disable",
      },
      Replaced: {
        Icon: RefreshCw,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
        text: "Replaced",
      },
      Unknown: {
        Icon: List,
        color: "text-gray-500",
        bg: "bg-gray-50",
        text: "Unknown",
      },
    };

    const config = statusConfig[rowData.status] || statusConfig.Unknown;
    const { Icon, color, bg, text } = config;

    return (
      <div className={`inline-flex items-center gap-1.5 py-1 rounded-md ${bg}`}>
        <Icon className={color} size={10} strokeWidth={2.2} />
        <span className={`font-semibold ${color} text-xs px-1.5`}>{text}</span>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Link to={`/asset/${rowData.id}`}>
        <Button
          icon="pi pi-eye"
          tooltip="Detail"
          tooltipOptions={{ position: "top" }}
          className="p-button-rounded p-button-info p-button-sm"
        />
      </Link>
      <Link to={`/asset/history/${rowData.asset_name}`}>
        <Button
          icon="pi pi-history"
          tooltip="History"
          tooltipOptions={{ position: "top" }}
          className="p-button-rounded p-button-secondary p-button-sm"
        />
      </Link>
    </div>
  );

  // ✨ [ปรับปรุง] Config สำหรับปุ่มฟิลเตอร์แต่ละประเภท
  const filterStyles = {
    gray: {
      base: "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
      active: "bg-gray-800 text-white border-gray-800",
      countBg: "bg-gray-100",
      countText: "text-gray-600",
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
    indigo: {
      base: "border-indigo-400 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
      active: "bg-indigo-600 text-white border-indigo-600",
      countBg: "bg-indigo-200/50",
      countText: "text-indigo-900",
      activeCountBg: "bg-white/25",
      activeCountText: "text-white",
    },
  };

  const statusFilterConfig = {
    All: { icon: List, styles: filterStyles.gray },
    Enable: { icon: CheckCircle2, styles: filterStyles.green },
    Disable: { icon: XCircle, styles: filterStyles.red },
    Replaced: { icon: RefreshCw, styles: filterStyles.yellow },
    Default: { icon: List, styles: filterStyles.gray },
  };

  const categoryFilterConfig = {
    All: { icon: Layers, styles: filterStyles.gray },
    Default: { icon: Layers, styles: filterStyles.green },
  };

  const departmentFilterConfig = {
    All: { icon: Building, styles: filterStyles.gray },
    Default: { icon: Building, styles: filterStyles.indigo },
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent mb-6">
        Asset List
      </h1>

      {/* ✨ [ปรับปรุง] ใช้ Component FilterSummaryButtons ใหม่ */}
      <h3 className="font-semibold mb-2 text-gray-700">Status</h3>
      <FilterSummaryButtons
        data={statusCounts}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        config={statusFilterConfig}
      />

      <h3 className="font-semibold mb-2 mt-4 text-gray-700">Category</h3>
      <FilterSummaryButtons
        data={categoryCounts}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        config={categoryFilterConfig}
      />

      <h3 className="font-semibold mb-2 mt-4 text-gray-700">Department</h3>
      <FilterSummaryButtons
        data={departmentCounts}
        activeFilter={departmentFilter}
        onFilterChange={setDepartmentFilter}
        config={departmentFilterConfig}
      />

      <Toolbar
        className="mb-4 mt-4 flex flex-col items-stretch gap-4 p-2 md:flex-row md:items-center md:justify-between"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <div className="overflow-x-auto">
        {/* ✨ [ปรับปรุง] เพิ่ม ClassName และ Props ให้ DataTable */}
        <DataTable
          ref={dt}
          value={filteredAssets}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 50, 100]}
          loading={loading}
          rowHover
          size="small"
          showGridlines
          globalFilter={globalFilter}
          globalFilterFields={[
            "serial_number",
            "asset_name",
            "category",
            "location",
            "department",
            "user_id",
            "user_name",
            "status",
            "ip_addresses",
            "fin_asset_ref_no"
          ]}
          emptyMessage="No assets found."
          className="shadow-md rounded-lg overflow-hidden border border-gray-200 text-gray-800 datatable-hover-effect"
        >
          {/* ✨ [ปรับปรุง] เพิ่ม ClassName ให้ทุก Column */}
          <Column
            header="Picture"
            body={pictureBodyTemplate}
            style={{ width: "100px" }}
            headerClassName="text-sm"
          />
          <Column
            field="asset_name"
            header="IT Asset"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="category"
            header="Category"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="location"
            header="Location"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="department"
            header="Department"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="user_id"
            header="User ID"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            field="user_name"
            header="Device User"
            sortable
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            header="Status"
            body={statusBodyTemplate}
            sortable
            field="status"
            style={{ width: "120px" }}
            bodyClassName="text-gray-800 text-sm"
            headerClassName="text-sm"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
            headerClassName="text-sm"
          />
        </DataTable>
      </div>
    </div>
  );
}

export default AssetListPage;
