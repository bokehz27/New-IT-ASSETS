// ✅ UPDATED FULL FILE — AssetDetailPage.js

import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReplaceAssetModal from "../components/ReplaceAssetModal";

// --- ICONS ---
const DocumentTextIcon = ({ className = "h-6 w-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// --- SUB COMPONENTS ---

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Enable: "bg-green-100 text-green-800",
    Disable: "bg-red-100 text-red-800",
    "In Stock": "bg-blue-100 text-blue-800",
    Replaced: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-slate-100 text-slate-800"
      }`}
    >
      {status || "N/A"}
    </span>
  );
};

// ✅ AUTO-HIDE IF EMPTY
const DetailItem = ({ label, children, value }) => {
  const hasValue =
    (typeof value === "string" && value.trim() !== "") ||
    (Array.isArray(value) && value.length > 0) ||
    (!!children && children !== null);

  if (!hasValue) return null;
  return (
    <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800 col-span-2 break-words">
        {children || value}
      </dd>
    </div>
  );
};

const ConditionalCard = ({ title, children }) => {
  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="divide-y divide-slate-200">{validChildren}</div>
    </div>
  );
};

function AssetDetailPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);

  const fetchAsset = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assets/${assetId}`);
      setAsset(response.data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถดึงรายละเอียดอุปกรณ์ได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  const handleReplaceSuccess = (newAsset) => {
    setReplaceModalOpen(false);
    alert(
      `Asset ${asset.asset_name} replaced by ${newAsset.asset_name} successfully!`
    );
    navigate(`/asset/${newAsset.id}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete this asset: ${asset.asset_name}?`
      )
    ) {
      try {
        await api.delete(`/assets/${assetId}`);
        toast.success("Asset deleted successfully!");
        navigate("/assets");
      } catch (error) {
        toast.error("Failed to delete asset.");
        console.error(error);
      }
    }
  };

  if (loading)
    return <div className="text-center p-10 text-slate-500">Loading...</div>;
  if (error)
    return (
      <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  if (!asset) return <div className="text-center p-10">No asset found.</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            ASSET:{" "}
            <span className="bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
              {asset.asset_name}
            </span>
          </h2>
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm text-slate-500">Status:</p>
            <StatusBadge status={asset.status} />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setReplaceModalOpen(true)}
            className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
          >
            Replace
          </button>
          <Link
            to={`/edit/${asset.id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ========== CONTENT GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Hardware */}
          <ConditionalCard title="Hardware Specifications">
            <DetailItem
              label="Brand / Model"
              value={`${asset.brand || ""} ${asset.model || ""}`.trim()}
            />
            <DetailItem label="Serial Number" value={asset.serial_number} />
            <DetailItem
              label="Category"
              value={`${asset.category || ""} / ${
                asset.subcategory || ""
              }`.trim()}
            />
            <DetailItem label="CPU" value={asset.cpu} />
            <DetailItem label="Memory (RAM)" value={asset.ram} />
            <DetailItem label="Hard Disk" value={asset.storage} />
          </ConditionalCard>

          {/* ✅ For Printer (always shown) */}
          <ConditionalCard title="For Printer">
            <DetailItem label="PA" value={asset.pa} />
            <DetailItem label="PRT" value={asset.prt} />
          </ConditionalCard>

          {/* ✅ Network */}
          <ConditionalCard title="Network Information">
            <DetailItem label="Device ID" value={asset.device_id} />
            <DetailItem
              label="Mac Address - LAN"
              value={asset.mac_address_lan}
            />
            <DetailItem
              label="Mac Address - WiFi"
              value={asset.mac_address_wifi}
            />
            <DetailItem label="Wifi Status" value={asset.wifi_status} />

            {asset.assignedIps?.length > 0 && (
              <DetailItem label="Assigned IPs">
                <ul className="list-disc list-inside space-y-1">
                  {asset.assignedIps.map((ip) => (
                    <li key={ip.id}>{ip.ip_address}</li>
                  ))}
                </ul>
              </DetailItem>
            )}
          </ConditionalCard>

          {/* ✅ Software */}
          <ConditionalCard title="Software Information">
            <DetailItem label="Windows" value={asset.windows_version} />
            <DetailItem
              label="Windows Product Key"
              value={asset.windows_product_key}
            />
            <DetailItem label="Microsoft Office" value={asset.office_version} />
            <DetailItem
              label="Office Product Key"
              value={asset.office_product_key}
            />
            <DetailItem label="Antivirus" value={asset.antivirus} />

            {asset.specialPrograms?.length > 0 && (
              <DetailItem label="Special Programs">
                <table className="min-w-full text-xs sm:text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {asset.specialPrograms
                      .slice()
                      .sort((a, b) =>
                        a.program_name.localeCompare(b.program_name, "en", {
                          sensitivity: "base",
                        })
                      )
                      .map((prog) => (
                        <tr key={prog.id}>
                          <td className="py-1.5 pr-4 font-medium text-slate-800">
                            {prog.program_name}
                          </td>
                          <td className="py-1.5 text-slate-500">
                            {prog.license_key || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </DetailItem>
            )}
          </ConditionalCard>

          {/* ✅ BitLocker */}
          {asset.bitlocker_csv_file && (
            <ConditionalCard title="BitLocker Recovery Keys">
              <div className="p-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-md">
                  <div className="flex items-center min-w-0">
                    <DocumentTextIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium text-slate-800 truncate">
                      {asset.bitlocker_csv_file.split("/").pop()}
                    </span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href={`${process.env.REACT_APP_API_URL.replace(
                        "/api",
                        ""
                      )}${asset.bitlocker_csv_file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </ConditionalCard>
          )}
        </div>

        {/* ✅ Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <ConditionalCard title="Configuration and Location">
            <DetailItem label="User" value={asset.user_name} />
            <DetailItem label="User ID" value={asset.user_id} />
            <DetailItem
              label="Department / Division"
              value={asset.department}
            />
            <DetailItem label="Location" value={asset.location} />
          </ConditionalCard>

          <ConditionalCard title="Management Details">
            <DetailItem
              label="Start Date"
              value={
                asset.start_date
                  ? new Date(asset.start_date).toLocaleDateString("en-GB")
                  : ""
              }
            />
            <DetailItem
              label="Ref. FIN Asset No."
              value={asset.fin_asset_ref_no}
            />
          </ConditionalCard>
          <ConditionalCard title="Maintenance">
            <DetailItem
              label="Start Maintenance"
              value={asset.maintenance_start_date}
            />
            <DetailItem
              label="End Maintenance"
              value={asset.maintenance_end_date}
            />
            <DetailItem label="Maintenance Price">
              {asset.maintenance_price != null
                ? `${Number(asset.maintenance_price).toLocaleString()} ฿`
                : ""}
            </DetailItem>
          </ConditionalCard>

          {asset.remark && (
            <ConditionalCard title="Remark">
              <div className="p-4 text-sm text-slate-800 break-words whitespace-pre-wrap">
                {asset.remark}
              </div>
            </ConditionalCard>
          )}
        </div>
      </div>

      {isReplaceModalOpen && (
        <ReplaceAssetModal
          asset={asset}
          onClose={() => setReplaceModalOpen(false)}
          onSuccess={handleReplaceSuccess}
        />
      )}
    </div>
  );
}

export default AssetDetailPage;
