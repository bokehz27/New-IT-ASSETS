import React from 'react';

// Helper Component สำหรับ Select: ลบคลาสสไตล์ออกทั้งหมดเพราะถูกควบคุมโดย global style
const SelectInput = ({ name, label, value, onChange, options = [] }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-semibold text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full" // เหลือแค่คลาสสำหรับ layout
    >
      <option value="">-- Select --</option>
      {options.map(optionValue => (
        <option key={optionValue} value={optionValue}>{optionValue}</option>
      ))}
    </select>
  </div>
);

// Helper Component สำหรับ Input: ลบคลาสสไตล์ออกทั้งหมดเพราะถูกควบคุมโดย global style
const TextInput = ({ name, label, value, onChange, placeholder, required = false }) => (
   <div className="flex flex-col">
    <label className="mb-1 text-sm font-semibold text-gray-700">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full" // เหลือแค่คลาสสำหรับ layout
    />
  </div>
);


function AssetForm({ isEditing, formData, setFormData, onSubmit, onCancel, masterData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    // Card หลัก: ใช้ bg-white และ shadow-md ที่ถูก override ใน index.css
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {isEditing ? 'Edit Asset' : 'Add New Asset'}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">

        {/* Column 1: Asset Details */}
        <TextInput name="asset_code" label="รหัสอุปกรณ์" value={formData.asset_code} onChange={handleChange} placeholder="Asset Code" />
        <SelectInput name="brand" label="ยี่ห้ออุปกรณ์" value={formData.brand} onChange={handleChange} options={masterData.brand} />
        <TextInput name="model" label="รุ่นอุปกรณ์" value={formData.model} onChange={handleChange} placeholder="Model (e.g., XPS 15)" required />
        <TextInput name="serial_number" label="หมายเลขซีเรียล" value={formData.serial_number} onChange={handleChange} placeholder="Serial Number" />
        <SelectInput name="category" label="หมวดหมู่อุปกรณ์" value={formData.category} onChange={handleChange} options={masterData.category} />
        <SelectInput name="subcategory" label="หมวดหมู่ย่อย" value={formData.subcategory} onChange={handleChange} options={masterData.subcategory} />

        {/* Column 2: Specifications */}
        <SelectInput name="ram" label="หน่วยความจำ (แรม)" value={formData.ram} onChange={handleChange} options={masterData.ram} />
        <TextInput name="cpu" label="ซีพียู" value={formData.cpu} onChange={handleChange} placeholder="CPU (e.g., Intel Core i7)" />
        <SelectInput name="storage" label="ฮาร์ดดิสก์" value={formData.storage} onChange={handleChange} options={masterData.storage} />
        <TextInput name="device_id" label="Device ID" value={formData.device_id} onChange={handleChange} placeholder="Device ID" />
        <TextInput name="ip_address" label="IP Address" value={formData.ip_address} onChange={handleChange} placeholder="IP Address" />
        <TextInput name="mac_address_lan" label="Mac Address - LAN" value={formData.mac_address_lan} onChange={handleChange} placeholder="XX:XX:XX:XX:XX:XX" />
        <TextInput name="mac_address_wifi" label="Mac Address - WiFi" value={formData.mac_address_wifi} onChange={handleChange} placeholder="XX:XX:XX:XX:XX:XX" />
        <SelectInput name="wifi_registered" label="Wifi Register" value={formData.wifi_registered} onChange={handleChange} options={['NONE', 'Registered Korat', 'Registered Nava', 'Registered Korat - Nava']} />

        {/* Column 3: User & Location */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold text-gray-700">วันที่เริ่มใช้งาน</label>
          {/* Date Input: ลบคลาสสไตล์ออกเพื่อให้รับ global style เช่นกัน */}
          <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full" />
        </div>
        <SelectInput name="location" label="พื้นที่ใช้งาน" value={formData.location} onChange={handleChange} options={masterData.location} />
        <TextInput name="fin_asset_ref" label="Ref. FIN Asset No." value={formData.fin_asset_ref} onChange={handleChange} placeholder="00-00-0000 / NONE" />
        <SelectInput name="user_name" label="ชื่อ - นามสกุลผู้ใช้" value={formData.user_name} onChange={handleChange} options={masterData.user_name} />
        <TextInput name="user_id" label="User ID" value={formData.user_id} onChange={handleChange} placeholder="User ID" />
        <SelectInput name="department" label="หน่วยงาน / แผนก" value={formData.department} onChange={handleChange} options={masterData.department} />
        <SelectInput name="status" label="สถานะ" value={formData.status} onChange={handleChange} options={['Enable', 'Deprecated']} />

        {/* Action Buttons */}
        <div className="flex space-x-4 lg:col-span-3 mt-4">
          {/* ปุ่ม Submit: เปลี่ยนไปใช้คลาส bg-blue-600 ซึ่ง map กับสี --color-primary */}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition">
            {isEditing ? 'Update Asset' : 'Add Asset'}
          </button>
          {/* ปุ่ม Cancel: เปลี่ยนไปใช้สไตล์ปุ่มรอง (bg-gray-200) เพื่อความแตกต่าง */}
          {isEditing && (
            <button type="button" onClick={onCancel} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AssetForm;