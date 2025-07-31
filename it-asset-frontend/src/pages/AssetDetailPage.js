import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_URL = 'http://172.18.1.61:5000/api/assets';

function AssetDetailPage() {
  const { assetId } = useParams(); // ดึง ID จาก URL
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${assetId}`);
        setAsset(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch asset details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600">{error}</div>;
  if (!asset) return <div className="text-center p-10">Asset not found.</div>;

  // Helper function for displaying data
  const DetailItem = ({ label, value }) => (
    <div className="py-3 sm:py-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-200">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Asset Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          รหัสอุปกรณ์: <span className="font-semibold">{asset.asset_code}</span>
        </p>
      </div>
      <dl>
        <DetailItem label="ยี่ห้ออุปกรณ์" value={asset.brand} />
        <DetailItem label="รุ่นอุปกรณ์" value={asset.model} />
        <DetailItem label="หมายเลขซีเรียล" value={asset.serial_number} />
        <DetailItem label="หมวดหมู่อุปกรณ์" value={asset.category} />
        <DetailItem label="หมวดหมู่ย่อย" value={asset.subcategory} />
        <DetailItem label="หน่วยความจำ (แรม)" value={asset.ram} />
        <DetailItem label="ซีพียู" value={asset.cpu} />
        <DetailItem label="ฮาร์ดดิสก์" value={asset.storage} />
        <DetailItem label="Device ID" value={asset.device_id} />
        <DetailItem label="IP Address" value={asset.ip_address} />
        <DetailItem label="Wifi Register" value={asset.wifi_registered} />
        <DetailItem label="Mac Address - LAN" value={asset.mac_address_lan} />
        <DetailItem label="Mac Address - WiFi" value={asset.mac_address_wifi} />
        <DetailItem label="วันที่เริ่มใช้งาน" value={asset.start_date ? new Date(asset.start_date).toLocaleDateString('th-TH') : 'N/A'} />
        <DetailItem label="พื้นที่ใช้งาน" value={asset.location} />
        <DetailItem label="Ref. FIN Asset No." value={asset.fin_asset_ref} />
        <DetailItem label="ผู้ใช้งาน (User ID)" value={asset.user_id} />
        <DetailItem label="ผู้ใช้งาน (ชื่อ - นามสกุล)" value={asset.user_name} />
        <DetailItem label="หน่วยงาน / แผนก" value={asset.department} />
        <DetailItem label="สถานะ" value={asset.status} />
      </dl>
       <div className="p-4 sm:p-6 bg-gray-50 text-right">
          <Link 
            to={`/edit/${asset.id}`} 
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
              Edit this Asset
          </Link>
        </div>
    </div>
  );
}

export default AssetDetailPage;