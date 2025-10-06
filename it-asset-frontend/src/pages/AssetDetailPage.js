// src/pages/AssetDetailPage.js

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
const PencilIcon = ({ className = "h-4 w-4" }) => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);
const TrashIcon = ({ className = "h-4 w-4" }) => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// --- SUB-COMPONENTS (RE-STYLED) ---
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

const InfoCard = ({ title, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="p-4 border-b border-slate-200 bg-slate-50">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="divide-y divide-slate-200">{children}</div>
  </div>
);

const DetailItem = ({ label, children, value }) => (
  <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800 col-span-2 break-words">
      {children || value || <span className="text-slate-400">N/A</span>}
    </dd>
  </div>
);

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
        navigate("/assets"); // พาผู้ใช้กลับไปที่หน้ารายการ
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
      {/* --- [NEW DESIGN] PAGE HEADER --- */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Hardware Specifications">
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
          </InfoCard>

          <InfoCard title="Network Information">
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
            <DetailItem label="Assigned IPs">
              {asset.assignedIps && asset.assignedIps.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {asset.assignedIps.map((ip) => (
                    <li key={ip.id}>{ip.ip_address}</li>
                  ))}
                </ul>
              ) : null}
            </DetailItem>
          </InfoCard>

          <InfoCard title="Software Information">
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
            <DetailItem label="Special Programs">
              {asset.specialPrograms && asset.specialPrograms.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {asset.specialPrograms.map((prog) => (
                    <li key={prog.id}>
                      {prog.program_name}
                      {prog.license_key && (
                        <span className="text-slate-500 ml-2">
                          (Key: {prog.license_key})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </DetailItem>
          </InfoCard>

          <InfoCard title="BitLocker Recovery Keys">
            <div className="p-4">
              {asset.bitlocker_csv_file ? (
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
              ) : (
                <p className="text-sm text-slate-500">
                  No BitLocker file uploaded for this asset.
                </p>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="Configuration and Location">
            <DetailItem label="User" value={asset.user_name} />
            <DetailItem label="User ID" value={asset.user_id} />
            <DetailItem
              label="Department / Division"
              value={asset.department}
            />
            <DetailItem label="Location" value={asset.location} />
          </InfoCard>

          <InfoCard title="Management Details">
            <DetailItem
              label="Start Date"
              value={
                asset.start_date
                  ? new Date(asset.start_date).toLocaleDateString("en-GB")
                  : null
              }
            />
            <DetailItem
              label="Ref. FIN Asset No."
              value={asset.fin_asset_ref_no}
            />
          </InfoCard>

          <InfoCard title="Remark">
            <div className="p-4 text-sm text-slate-800 break-words whitespace-pre-wrap">
              {asset.remark || <span className="text-slate-400">N/A</span>}
            </div>
          </InfoCard>
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
