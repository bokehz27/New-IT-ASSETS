import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import BitlockerImport from '../components/BitlockerImport'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://172.18.1.61:5000/api';

// --- (แก้ไข) ย้ายคอมโพเนนต์ย่อยมาไว้ข้างบน และใส่โค้ดให้สมบูรณ์ ---
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Enable': 'bg-green-100 text-green-800',
        'Disable': 'bg-red-100 text-red-800',
        'In Stock': 'bg-blue-100 text-blue-800',
        'In Use': 'bg-yellow-100 text-yellow-800',
    };
    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status || 'N/A'}
        </span>
    );
};

const InfoCard = ({ title, children }) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="divide-y divide-gray-200">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="px-4 py-3 grid grid-cols-3 gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2 break-words">{value || 'N/A'}</dd>
    </div>
);
// --- สิ้นสุดการแก้ไข ---


function AssetDetailPage() {
    const { assetId } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAsset = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/assets/${assetId}`, {
                headers: { 'x-auth-token': token }
            });
            setAsset(response.data);
            setError(null);
        } catch (err) {
            setError('ไม่สามารถดึงรายละเอียดอุปกรณ์ได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [assetId]);

    useEffect(() => {
        fetchAsset();
    }, [fetchAsset]);

    if (loading) return <div className="text-center p-10">กำลังโหลด...</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;
    if (!asset) return <div className="text-center p-10">ไม่พบข้อมูลอุปกรณ์</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        IT ASSET : <span className="text-blue-600">{asset.asset_code}</span>
                    </h2>
                    <div className="mt-2 flex items-center space-x-2">
                        <p className="text-sm text-gray-500">Status :</p>
                        <StatusBadge status={asset.status} />
                    </div>
                </div>
                <Link to={`/edit/${asset.id}`} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition">
                    Edit
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Hardware specifications">
                        <DetailItem label="ยี่ห้อ / รุ่น" value={`${asset.brand || ''} ${asset.model || ''}`.trim()} />
                        <DetailItem label="หมายเลขซีเรียล" value={asset.serial_number} />
                        <DetailItem label="หมวดหมู่" value={`${asset.category || ''} / ${asset.subcategory || ''}`.trim()} />
                        <DetailItem label="ซีพียู" value={asset.cpu} />
                        <DetailItem label="หน่วยความจำ (แรม)" value={asset.ram} />
                        <DetailItem label="ฮาร์ดดิสก์" value={asset.storage} />
                    </InfoCard>

                    <InfoCard title="Network information">
                        <DetailItem label="Device ID" value={asset.device_id} />
                        <DetailItem label="IP Address" value={asset.ip_address} />
                        <DetailItem label="Mac Address - LAN" value={asset.mac_address_lan} />
                        <DetailItem label="Mac Address - WiFi" value={asset.mac_address_wifi} />
                        <DetailItem label="Wifi Register" value={asset.wifi_registered} />
                    </InfoCard>

                    <InfoCard title="Software Information">
                        <DetailItem label="Windows" value={asset.windows_version} />
                        <DetailItem label="Windows Product Key" value={asset.windows_key} />
                        <DetailItem label="Microsoft Office" value={asset.office_version} />
                        <DetailItem label="Office Product Key" value={asset.office_key} />
                        <DetailItem label="Antivirus" value={asset.antivirus} />
                        <div className="px-4 py-3 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500">Special Programs</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2">
                                {asset.specialPrograms && asset.specialPrograms.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {asset.specialPrograms.map((prog) => (
                                            <span 
                                                key={prog.id} 
                                                className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
                                            >
                                                {prog.program_name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    'N/A'
                                )}
                            </dd>
                        </div>
                    </InfoCard>

                    <InfoCard title="BitLocker Recovery Keys">
                         {asset.bitlockerKeys && asset.bitlockerKeys.length > 0 ? (
                            asset.bitlockerKeys.map((key) => (
                                <DetailItem key={key.id} label={`Drive ${key.drive_name}`} value={key.recovery_key} />
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                No BitLocker keys found for this asset.
                            </div>
                        )}
                    </InfoCard>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title="Configuration and location">
                        <DetailItem label="ผู้ใช้งาน" value={asset.user_name} />
                        <DetailItem label="User ID" value={asset.user_id} />
                        <DetailItem label="หน่วยงาน / แผนก" value={asset.department} />
                        <DetailItem label="พื้นที่ใช้งาน" value={asset.location} />
                    </InfoCard>

                    <InfoCard title="Management details">
                        <DetailItem label="วันที่เริ่มใช้งาน" value={asset.start_date ? new Date(asset.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
                        <DetailItem label="Ref. FIN Asset No." value={asset.fin_asset_ref} />
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}

export default AssetDetailPage;