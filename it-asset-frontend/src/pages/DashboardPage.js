import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import AssetCategoryChart from '../components/AssetCategoryChart';

const StatCard = ({ title, value, icon, color }) => (
    <Card className={`shadow-md rounded-lg text-white ${color}`}>
        <div className="flex justify-between items-center">
            <div>
                <div className="text-lg font-medium">{title}</div>
                <div className="text-3xl font-bold">{value}</div>
            </div>
            <i className={`pi ${icon} text-4xl opacity-50`}></i>
        </div>
    </Card>
);

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                setSummary(res.data);
            } catch (error) {
                toast.error("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);
    
    const dateBodyTemplate = (rowData) => {
        return new Date(rowData.created_at).toLocaleDateString('th-TH');
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                {/* ✨ แก้ไข Skeleton ให้เหลือ 4 อัน */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} height="120px" className="rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2"><Skeleton height="450px" className="rounded-lg"/></div>
                    <div><Skeleton height="450px" className="rounded-lg"/></div>
                </div>
            </div>
        );
    }
    
    if (!summary) {
        return <div className="p-4 text-center">Failed to load dashboard data.</div>
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
            
            {/* ✨ แก้ไข Stat Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Assets" value={summary.stats.totalAssets} icon="pi-box" color="bg-blue-500" />
                <StatCard title="Total Tickets" value={summary.stats.totalTickets} icon="pi-ticket" color="bg-purple-500" />
                <StatCard title="Pending Tickets" value={summary.stats.pendingTickets} icon="pi-exclamation-circle" color="bg-orange-500" />
                <StatCard title="In Progress" value={summary.stats.inProgressTickets} icon="pi-spin pi-spinner" color="bg-teal-500" />
                {/* ✨ เอา StatCard ของ Switch ออก */}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Recent Tickets" className="lg:col-span-2 shadow-md rounded-lg">
                    <DataTable value={summary.recentTickets} size="small" scrollable scrollHeight="350px">
                        <Column header="Date" body={dateBodyTemplate} style={{width: '120px'}}/>
                        <Column field="Asset.asset_name" header="Asset" />
                        <Column field="Employee.name" header="Reporter" />
                        <Column field="issue_description" header="Issue" />
                    </DataTable>
                </Card>

                <Card title="Assets by Category" className="shadow-md rounded-lg">
                    <AssetCategoryChart data={summary.assetsByCategory} />
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;