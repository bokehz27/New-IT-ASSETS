// src/components/IpAssignmentForm.js
import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import SearchableDropdown from "./SearchableDropdown";
import {
  ClipboardListIcon,
  ClipboardCheckIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/outline";

const IpList = ({ title, icon, ips, onIpClick, emptyText, buttonStyle }) => (
    // ... (ส่วนนี้เหมือนเดิม ไม่มีการเปลี่ยนแปลง)
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
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
  const [selectedVlan, setSelectedVlan] = useState(null);
  const [availableIps, setAvailableIps] = useState([]);
  const [assignedIps, setAssignedIps] = useState(initialAssignedIps);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get("/vlans").then((res) => setVlans(res.data));
  }, []);

  useEffect(() => {
    if (initialAssignedIps.length > 0) {
      onChange(initialAssignedIps.map((ip) => ip.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedVlan) {
      api.get(`/ips?vlan_id=${selectedVlan}`).then((res) => {
        setAvailableIps(res.data);
        setSearchQuery("");
      });
    } else {
      setAvailableIps([]);
    }
  }, [selectedVlan]);

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

  const filteredAvailableIps = availableIps.filter((ip) =>
    ip.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filter VLAN */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Filter by VLAN
        </label>
        <SearchableDropdown
          options={vlanOptions}
          value={selectedVlan}
          onChange={(value) => setSelectedVlan(value)}
          placeholder="-- Select a VLAN --"
        />
      </div>

      {/* ✨ 1. ย้ายช่องค้นหามาไว้ตรงนี้ */}
      <div>
        <label htmlFor="ip-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Available IP
        </label>
        <input
          type="text"
          name="ip-search"
          id="ip-search"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Search IP Address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!selectedVlan}
        />
      </div>

      {/* ✨ 2. Grid จะเหลือแค่ส่วนแสดงรายการ IP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available IPs List */}
        <IpList
          title="Available IPs"
          icon={<ClipboardListIcon className="h-5 w-5 mr-2 text-gray-400" />}
          ips={filteredAvailableIps}
          onIpClick={assignIp}
          emptyText={selectedVlan ? "No available IPs found" : "Select a VLAN to see IPs"}
          buttonStyle={{
            base: "bg-white border",
            hover: "hover:bg-sky-100 hover:border-sky-300",
            icon: <PlusCircleIcon className="h-5 w-5 text-sky-500" />,
          }}
        />
        
        {/* Assigned IPs List */}
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