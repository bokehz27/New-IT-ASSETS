// src/components/IpAssignmentForm.js

import React, { useState, useEffect } from "react";
import api from "../api";

function IpAssignmentForm({ initialAssignedIps = [], onChange }) {
  const [vlans, setVlans] = useState([]);
  const [selectedVlan, setSelectedVlan] = useState("");
  const [availableIps, setAvailableIps] = useState([]);
  
  // ✨ FIX: ตั้งค่า state เริ่มต้นของ IP ที่ถูกเลือก ด้วยข้อมูลที่ได้รับมา
  const [assignedIps, setAssignedIps] = useState(initialAssignedIps);

  // Load Vlans on mount and set initial state for parent form
  useEffect(() => {
    api.get("/vlans").then((res) => setVlans(res.data));
    
    // ✨ FIX: เรียก onChange ตอนเริ่มต้นเพื่อให้ฟอร์มแม่ (AssetForm) มีข้อมูล ID ของ IP ตั้งแต่แรก
    if (initialAssignedIps.length > 0) {
      onChange(initialAssignedIps.map(ip => ip.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array ว่างเพื่อให้ทำงานแค่ครั้งเดียวตอนเริ่มต้น

  // Fetch available IPs when a Vlan is selected
  useEffect(() => {
    if (selectedVlan) {
      api.get(`/ips?vlan_id=${selectedVlan}`).then((res) => {
        // API จะส่งมาเฉพาะ IP ที่ยังว่างอยู่จริงๆ
        setAvailableIps(res.data);
      });
    } else {
      setAvailableIps([]);
    }
  }, [selectedVlan]);
  
  // Handle IP assignment
  const assignIp = (ip) => {
    const newAssignedIps = [...assignedIps, ip];
    setAssignedIps(newAssignedIps);
    setAvailableIps(availableIps.filter(i => i.id !== ip.id));
    onChange(newAssignedIps.map(i => i.id));
  };

  const unassignIp = (ip) => {
    const newAssignedIps = assignedIps.filter(i => i.id !== ip.id);
    setAssignedIps(newAssignedIps);
    // ถ้า IP ที่เอาออก อยู่ใน VLAN ที่กำลังเลือกอยู่ ให้เพิ่มกลับไปในลิสต์ available
    if (ip.vlan_id === parseInt(selectedVlan)) {
      setAvailableIps([...availableIps, ip].sort((a,b) => a.ip_address.localeCompare(b.ip_address, undefined, { numeric: true })));
    }
    onChange(newAssignedIps.map(i => i.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Filter by VLAN
        </label>
        <select
          value={selectedVlan}
          onChange={(e) => setSelectedVlan(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-50"
        >
          <option value="">-- Select a VLAN --</option>
          {vlans.map((vlan) => (
            <option key={vlan.id} value={vlan.id}>
              {vlan.name} ({vlan.site})
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Available IPs</h4>
          <div className="border rounded-md h-48 overflow-y-auto p-2 space-y-1 bg-gray-50">
            {availableIps.map((ip) => (
              <button
                key={ip.id}
                type="button"
                onClick={() => assignIp(ip)}
                className="w-full text-left p-2 bg-white hover:bg-blue-100 rounded text-sm border"
              >
                {ip.ip_address}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Assigned IPs</h4>
           <div className="border rounded-md h-48 overflow-y-auto p-2 space-y-1 bg-gray-50">
            {assignedIps.map((ip) => (
               <button
                key={ip.id}
                type="button"
                onClick={() => unassignIp(ip)}
                className="w-full text-left p-2 bg-green-100 hover:bg-red-100 rounded text-sm border border-green-200"
              >
                {ip.ip_address}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IpAssignmentForm;