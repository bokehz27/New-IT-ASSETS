// src/pages/AssetDetailPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useParams, Link, useNavigate } from 'react-router-dom'; // แก้ไข: เพิ่ม useNavigate

// Import component ใหม่ที่เราจะสร้าง
import ReplaceAssetModal from '../components/ReplaceAssetModal';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Enable': 'bg-green-100 text-green-800',
        'Disable': 'bg-red-100 text-red-800',
        'In Stock': 'bg-blue-100 text-blue-800',
        'Replaced': 'bg-red-100 text-red-800',
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

const DetailItem = ({ label, children, value }) => (
    <div className="px-4 py-3 grid grid-cols-3 gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2 break-words">
            {children || value || 'N/A'}
        </dd>
    </div>
);


function AssetDetailPage() {
    const { assetId } = useParams();
    const navigate = useNavigate(); // เพิ่ม: เรียกใช้ useNavigate
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // เพิ่ม: State สำหรับควบคุม Modal
    const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);

    const fetchAsset = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/assets/${assetId}`);
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

    // เพิ่ม: ฟังก์ชันเมื่อ replace สำเร็จ
    const handleReplaceSuccess = (newAsset) => {
        setReplaceModalOpen(false);
        alert(`Asset ${asset.asset_code} replaced by ${newAsset.asset_code} successfully!`);
        // ไปยังหน้า detail ของ asset ใหม่
        navigate(`/asset/${newAsset.id}`);
        //  Reload เพื่อให้ข้อมูลอัปเดต (ถ้า navigate ไม่ re-render)
        window.location.reload();
    };


    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;
    if (!asset) return <div className="text-center p-10">No assets found.</div>;

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
                {/* vvv ส่วนที่แก้ไข vvv */}
                <div className="flex items-center space-x-2">
                    <Link
                        onClick={() => setReplaceModalOpen(true)}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                        Replace
                    </Link>
                    <Link to={`/edit/${asset.id}`} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition">
                        Edit
                    </Link>
                </div>
                {/* ^^^ สิ้นสุดส่วนที่แก้ไข ^^^ */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Hardware specifications">
                        <DetailItem label="Brand / Model" value={`${asset.brand || ''} ${asset.model || ''}`.trim()} />
                        <DetailItem label="Serial Number" value={asset.serial_number} />
                        <DetailItem label="Category" value={`${asset.category || ''} / ${asset.subcategory || ''}`.trim()} />
                        <DetailItem label="CPU" value={asset.cpu} />
                        <DetailItem label="Memory (RAM)" value={asset.ram} />
                        <DetailItem label="Hard Disk" value={asset.storage} />
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
                        
                        <DetailItem label="Special Programs">
                            {asset.specialPrograms && asset.specialPrograms.length > 0 ? (
                                <div className="flex flex-col space-y-2">
                                    {asset.specialPrograms.map((prog) => (
                                        <div 
                                            key={prog.id} 
                                            className="self-start inline-flex items-center bg-gray-100 rounded-full pr-3 py-1 text-sm font-medium text-gray-800"
                                        >
                                            <span className="px-3">
                                                {prog.program_name}
                                            </span>
                                            {prog.license_key && (
                                                <span className="ml-1 text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded-full text-xs">
                                                    Key: {prog.license_key}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                'N/A'
                            )}
                        </DetailItem>

                    </InfoCard>

                    <InfoCard title="BitLocker Recovery Keys">
                         {asset.bitlockerKeys && asset.bitlockerKeys.length > 0 ? (
                            asset.bitlockerKeys.map((key) => (
                                <DetailItem key={key.id} label={`Identifier : ${key.drive_name}`} value={key.recovery_key} />
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
                        <DetailItem label="User" value={asset.user_name} />
                        <DetailItem label="User ID" value={asset.user_id} />
                        <DetailItem label="Department / Division" value={asset.department} />
                        <DetailItem label="Location" value={asset.location} />
                    </InfoCard>

                    <InfoCard title="Management details">
                        <DetailItem label="Start Date" value={asset.start_date ? new Date(asset.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} />
                        <DetailItem label="Ref. FIN Asset No." value={asset.fin_asset_ref} />
                    </InfoCard>
                </div>
            </div>

            {/* vvv เพิ่มการเรียกใช้ Modal ที่นี่ vvv */}
            {isReplaceModalOpen && (
                <ReplaceAssetModal 
                    asset={asset}
                    onClose={() => setReplaceModalOpen(false)}
                    onSuccess={handleReplaceSuccess}
                />
            )}
            {/* ^^^ จบส่วนที่เพิ่ม ^^^ */}
        </div>
    );
}

export default AssetDetailPage;