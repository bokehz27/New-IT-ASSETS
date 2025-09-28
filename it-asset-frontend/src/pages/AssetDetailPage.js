// src/pages/AssetDetailPage.js

import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReplaceAssetModal from "../components/ReplaceAssetModal";

// ✨ คอมโพเนนต์ย่อยที่ขาดไป ถูกเพิ่มกลับมาตรงนี้แล้ว ✨
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
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status || "N/A"}
    </span>
  );
};

const InfoCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="divide-y divide-gray-200">{children}</div>
  </div>
);

const DetailItem = ({ label, children, value }) => (
  <div className="px-4 py-3 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2 break-words">
      {children || value || "N/A"}
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
      // API จะ return ข้อมูลที่ flatten แล้วจาก backend
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


  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600">{error}</div>;
  if (!asset) return <div className="text-center p-10">No asset found.</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ASSET : <span className="text-blue-600">{asset.asset_name}</span>
          </h2>
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm text-gray-500">Status :</p>
            <StatusBadge status={asset.status} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button
            onClick={() => setReplaceModalOpen(true)}
            className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition"
          >
            Replace
          </button>
          <Link
            to={`/edit/${asset.id}`}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Hardware specifications">
            <DetailItem label="Brand / Model" value={`${asset.brand || ""} ${asset.model || ""}`.trim()} />
            <DetailItem label="Serial Number" value={asset.serial_number} />
            <DetailItem label="Category" value={`${asset.category || ""} / ${asset.subcategory || ""}`.trim()} />
            <DetailItem label="CPU" value={asset.cpu} />
            <DetailItem label="Memory (RAM)" value={asset.ram} />
            <DetailItem label="Hard Disk" value={asset.storage} />
          </InfoCard>

          <InfoCard title="Network information">
            <DetailItem label="Device ID" value={asset.device_id} />
            <DetailItem label="Mac Address - LAN" value={asset.mac_address_lan} />
            <DetailItem label="Mac Address - WiFi" value={asset.mac_address_wifi} />
            <DetailItem label="Wifi Status" value={asset.wifi_status} />
          </InfoCard>

          <InfoCard title="Software Information">
            <DetailItem label="Windows" value={asset.windows_version} />
            <DetailItem label="Windows Product Key" value={asset.windows_product_key} />
            <DetailItem label="Microsoft Office" value={asset.office_version} />
            <DetailItem label="Office Product Key" value={asset.office_product_key} />
            <DetailItem label="Antivirus" value={asset.antivirus} />
            <DetailItem label="Special Programs">
              {asset.specialPrograms && asset.specialPrograms.length > 0 ? (
                <div className="flex flex-col space-y-2">
                  {asset.specialPrograms.map((prog) => (
                    <div key={prog.id} className="self-start inline-flex items-center bg-gray-100 rounded-full pr-3 py-1 text-sm font-medium text-gray-800">
                      <span className="px-3">{prog.program_name}</span>
                      {prog.license_key && (
                        <span className="ml-1 text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded-full text-xs">
                          Key: {prog.license_key}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : "N/A"}
            </DetailItem>
          </InfoCard>

          <InfoCard title="BitLocker Recovery Keys">
            {asset.bitlocker_csv_file ? (
              <a href={`${process.env.REACT_APP_API_URL.replace("/api", "")}${asset.bitlocker_csv_file}`}
                 target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                Download BitLocker CSV
              </a>
            ) : (
              <p className="text-gray-500 px-4 py-3">No BitLocker file uploaded for this asset.</p>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="Configuration and location">
            <DetailItem label="User" value={asset.user_name} />
            <DetailItem label="User ID" value={asset.user_id} />
            <DetailItem label="Department / Division" value={asset.department} />
            <DetailItem label="Location" value={asset.location} />
          </InfoCard>

          <InfoCard title="Management details">
            <DetailItem label="Start Date" value={ asset.start_date ? new Date(asset.start_date).toLocaleDateString("en-GB") : "N/A" } />
            <DetailItem label="Ref. FIN Asset No." value={asset.fin_asset_ref_no} />
            <DetailItem label="Remark" value={asset.remark} />
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