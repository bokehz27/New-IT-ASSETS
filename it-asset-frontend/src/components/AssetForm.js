import React from "react";

// --- คอมโพเนนต์ย่อยสำหรับการจัดวางฟอร์ม ---
const InfoCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
    <label className="text-sm font-medium text-gray-700 md:text-right md:mr-4">
      {label}
    </label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

// --- คอมโพเนนต์หลักของฟอร์ม ---
function AssetForm({
  isEditing,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  masterData,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- ฟังก์ชันสำหรับจัดการ BitLocker Keys ---
  const handleKeyChange = (index, event) => {
    const { name, value } = event.target;
    const updatedKeys = [...(formData.bitlockerKeys || [])];
    updatedKeys[index][name] = value;
    setFormData((prev) => ({ ...prev, bitlockerKeys: updatedKeys }));
  };

  const handleAddKey = () => {
    setFormData((prev) => ({
      ...prev,
      bitlockerKeys: [
        ...(prev.bitlockerKeys || []),
        { drive_name: "", recovery_key: "" },
      ],
    }));
  };

  const handleRemoveKey = (index) => {
    const updatedKeys = [...(formData.bitlockerKeys || [])];
    updatedKeys.splice(index, 1);
    setFormData((prev) => ({ ...prev, bitlockerKeys: updatedKeys }));
  };

  // --- ฟังก์ชันสำหรับจัดการ Special Programs ---
  const handleProgramChange = (index, event) => {
    const { value } = event.target;
    const updatedPrograms = [...(formData.specialPrograms || [])];
    updatedPrograms[index] = { program_name: value };
    setFormData((prev) => ({ ...prev, specialPrograms: updatedPrograms }));
  };

  const handleAddProgram = () => {
    setFormData((prev) => ({
      ...prev,
      specialPrograms: [...(prev.specialPrograms || []), { program_name: "" }],
    }));
  };

  const handleRemoveProgram = (index) => {
    const updatedPrograms = [...(formData.specialPrograms || [])];
    updatedPrograms.splice(index, 1);
    setFormData((prev) => ({ ...prev, specialPrograms: updatedPrograms }));
  };

  return (
    <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-6">
      {/* ... ส่วนหัวของหน้า ... */}
      <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? `Edit device : ${formData.asset_code}` : "Add device"}
          </h2>
          <p className="text-sm text-gray-500">กรุณากรอกข้อมูลให้ครบถ้วน</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            {isEditing ? "Update" : "Add device"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Hardware specifications">
            <FormField label="รหัสอุปกรณ์">
              <input
                type="text"
                name="asset_code"
                value={formData.asset_code}
                onChange={handleChange}
                className="w-full"
                required
              />
            </FormField>
            <FormField label="หมวดหมู่หลัก">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {masterData.category.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="หมวดหมู่ย่อย">
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกหมวดหมู่ย่อย --</option>
                {masterData.subcategory.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="ยี่ห้อ">
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกยี่ห้อ --</option>
                {masterData.brand.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="รุ่น">
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="หมายเลขซีเรียล">
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="ซีพียู">
              <input
                type="text"
                name="cpu"
                value={formData.cpu}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="หน่วยความจำ (แรม)">
              <select
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือก RAM --</option>
                {masterData.ram.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="ฮาร์ดดิสก์">
              <select
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือก Storage --</option>
                {masterData.storage.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </InfoCard>

          <InfoCard title="Network information">
            <FormField label="Device ID">
              <input
                type="text"
                name="device_id"
                value={formData.device_id || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="IP Address">
              <input
                type="text"
                name="ip_address"
                value={formData.ip_address || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="Mac Address - LAN">
              <input
                type="text"
                name="mac_address_lan"
                value={formData.mac_address_lan || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="Mac Address - WiFi">
              <input
                type="text"
                name="mac_address_wifi"
                value={formData.mac_address_wifi || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="สถานะ WiFi">
              <select
                name="wifi_registered"
                value={formData.wifi_registered || "Wifi not register"}
                onChange={handleChange}
                className="w-full"
              >
                <option value="Wifi not register">Not Registered</option>
                <option value="Wifi ok">Registered</option>
              </select>
            </FormField>
          </InfoCard>

          <InfoCard title="Software Information">
            <FormField label="Windows">
              <select
                name="windows_version"
                value={formData.windows_version || ""}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกรุ่น Windows --</option>
                {(masterData.windows || []).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Windows Product Key">
              <input
                type="text"
                name="windows_key"
                value={formData.windows_key || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="Microsoft Office">
              <select
                name="office_version"
                value={formData.office_version || ""}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกรุ่น Office --</option>
                {(masterData.office || []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Office Product Key">
              <input
                type="text"
                name="office_key"
                value={formData.office_key || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="Antivirus">
              <select
                name="antivirus"
                value={formData.antivirus || ""}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกโปรแกรม Antivirus --</option>
                {(masterData.antivirus || []).map((av) => (
                  <option key={av} value={av}>
                    {av}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Special Programs">
              <div className="space-y-2">
                {(formData.specialPrograms || []).map((prog, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      name="program_name"
                      value={prog.program_name}
                      onChange={(e) => handleProgramChange(index, e)}
                      className="p-2 border rounded-md w-full"
                    >
                      <option value="">-- เลือกโปรแกรม --</option>
                      {(masterData.special_program || []).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveProgram(index)}
                      className="bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-600 transition"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddProgram}
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition mt-2"
                >
                  + Add Program
                </button>
              </div>
            </FormField>
          </InfoCard>

          <InfoCard title="BitLocker Recovery Keys">
            {(formData.bitlockerKeys || []).map((key, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  name="drive_name"
                  placeholder="Drive (เช่น C:)"
                  value={key.drive_name}
                  onChange={(e) => handleKeyChange(index, e)}
                  className="p-2 border rounded-md w-1/4"
                  required
                />
                <input
                  type="text"
                  name="recovery_key"
                  placeholder="Recovery Key 48 หลัก"
                  value={key.recovery_key}
                  onChange={(e) => handleKeyChange(index, e)}
                  className="p-2 border rounded-md flex-grow"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveKey(index)}
                  className="bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-600 transition"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddKey}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition mt-2"
            >
              + Add Key
            </button>
          </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="Configuration and location">
            <FormField label="ผู้ใช้งาน">
              <select
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกผู้ใช้งาน --</option>
                {masterData.user_name.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* === เพิ่ม Field สำหรับ User ID เข้ามาตรงนี้ === */}
            <FormField label="User ID">
              <input
                type="text"
                name="user_id"
                value={formData.user_id || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            {/* ======================================= */}

            <FormField label="หน่วยงาน / แผนก">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกแผนก --</option>
                {masterData.department.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="พื้นที่ใช้งาน">
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">-- เลือกสถานที่ --</option>
                {masterData.location.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </FormField>
          </InfoCard>

          <InfoCard title="Management details">
            <FormField label="สถานะ">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full"
                required
              >
                <option value="">-- เลือกสถานะ --</option>
                <option value="Enable">Enable</option>
                <option value="Disable">Disable</option>
              </select>
            </FormField>
            <FormField label="วันที่เริ่มใช้งาน">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
            <FormField label="Ref. FIN Asset No.">
              <input
                type="text"
                name="fin_asset_ref"
                value={formData.fin_asset_ref || ""}
                onChange={handleChange}
                className="w-full"
              />
            </FormField>
          </InfoCard>
        </div>
      </div>
    </form>
  );
}

export default AssetForm;
