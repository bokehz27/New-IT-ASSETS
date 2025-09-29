// src/components/IpAssignmentForm.js
import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import SearchableDropdown from "./SearchableDropdown"; // 1. Import SearchableDropdown
import {
  ClipboardListIcon,
  ClipboardCheckIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/outline"; // 2. Import Icons สวยๆ

// 3. สร้าง Sub-component สำหรับแสดงรายการ IP เพื่อลดโค้dที่ซ้ำซ้อน
const IpList = ({ title, icon, ips, onIpClick, emptyText, buttonStyle }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center mb-3">
      {icon}
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="border rounded-md h-48 overflow-y-auto p-2 space-y-1 bg-gray-50">
      {ips.length > 0 ? (
        ips.map((ip) => (
          <button
            key={ip.id}
            type="button"
            onClick={() => onIpClick(ip)}
            className={`w-full text-left p-2 rounded text-sm transition-colors duration-150 flex justify-between items-center ${buttonStyle.base} ${buttonStyle.hover}`}
          >
            <span>{ip.ip_address}</span>
            {buttonStyle.icon}
          </button>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          <p>{emptyText}</p>
        </div>
      )}
    </div>
  </div>
);

function IpAssignmentForm({ initialAssignedIps = [], onChange }) {
  const [vlans, setVlans] = useState([]);
  const [selectedVlan, setSelectedVlan] = useState(null); // ใช้ null เพื่อให้ SearchableDropdown ทำงานได้ดี
  const [availableIps, setAvailableIps] = useState([]);
  const [assignedIps, setAssignedIps] = useState(initialAssignedIps);

  // Load Vlans on mount
  useEffect(() => {
    api.get("/vlans").then((res) => setVlans(res.data));
  }, []);

  // Set initial state for parent form
  useEffect(() => {
    if (initialAssignedIps.length > 0) {
      onChange(initialAssignedIps.map((ip) => ip.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available IPs when a Vlan is selected
  useEffect(() => {
    if (selectedVlan) {
      api.get(`/ips?vlan_id=${selectedVlan}`).then((res) => {
        setAvailableIps(res.data);
      });
    } else {
      setAvailableIps([]);
    }
  }, [selectedVlan]);

  // 4. เตรียม options สำหรับ SearchableDropdown โดยใช้ useMemo
  const vlanOptions = useMemo(
    () =>
      vlans.map((vlan) => ({
        value: vlan.id,
        label: `${vlan.name} (${vlan.site})`,
      })),
    [vlans]
  );

  const assignIp = (ip) => {
    const newAssignedIps = [...assignedIps, ip];
    setAssignedIps(newAssignedIps);
    setAvailableIps(availableIps.filter((i) => i.id !== ip.id));
    onChange(newAssignedIps.map((i) => i.id));
  };

  const unassignIp = (ip) => {
    const newAssignedIps = assignedIps.filter((i) => i.id !== ip.id);
    setAssignedIps(newAssignedIps);
    if (ip.vlan_id === selectedVlan) {
      setAvailableIps(
        [...availableIps, ip].sort((a, b) =>
          a.ip_address.localeCompare(b.ip_address, undefined, { numeric: true })
        )
      );
    }
    onChange(newAssignedIps.map((i) => i.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Filter by VLAN
        </label>
        {/* 5. เปลี่ยนจาก Select ธรรมดามาใช้ SearchableDropdown */}
        <SearchableDropdown
          options={vlanOptions}
          value={selectedVlan}
          onChange={(value) => setSelectedVlan(value)}
          placeholder="-- Select a VLAN --"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IpList
          title="Available IPs"
          icon={<ClipboardListIcon className="h-5 w-5 mr-2 text-gray-400" />}
          ips={availableIps}
          onIpClick={assignIp}
          emptyText={selectedVlan ? "No available IPs" : "Select a VLAN to see IPs"}
          buttonStyle={{
            base: "bg-white border",
            hover: "hover:bg-sky-100 hover:border-sky-300",
            icon: <PlusCircleIcon className="h-5 w-5 text-sky-500" />,
          }}
        />
        <IpList
          title="Assigned IPs"
          icon={<ClipboardCheckIcon className="h-5 w-5 mr-2 text-gray-400" />}
          ips={assignedIps}
          onIpClick={unassignIp}
          emptyText="No IPs assigned"
          buttonStyle={{
            base: "bg-emerald-50 border border-emerald-200",
            hover: "hover:bg-rose-100 hover:border-rose-300",
            icon: <MinusCircleIcon className="h-5 w-5 text-rose-500" />,
          }}
        />
      </div>
    </div>
  );
}

export default IpAssignmentForm;