// src/components/AssetForm.js
import React, { useMemo, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import SearchableDropdown from "./SearchableDropdown"; // ✅ ปรับ path ตามโปรเจกต์ของคุณ
import axios from "axios";

// --- คอมโพเนนต์ย่อยสำหรับการจัดวางฟอร์ม (เดิม) ---
const InfoCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

const FormField = ({ label, children, error }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
    <label className="text-sm font-medium text-gray-700 md:text-right md:mr-4 pt-2">
      {label}
    </label>
    <div className="md:col-span-2">
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  </div>
);

// --- คอมโพเนนต์หลักของฟอร์ม (อัปเดตให้ใช้ SearchableDropdown) ---
function AssetForm({ isEditing, formData, onSubmit, onCancel, masterData }) {
  const [bitlockerFile, setBitlockerFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const fileInputRef = useRef(null);

  const handleFormSubmit = async (data) => {
    // ส่งทั้งข้อมูลฟอร์มและไฟล์กลับไปให้ Page จัดการ
    // ไม่ต้องทำการอัปโหลดในนี้แล้ว
    await onSubmit({ data, file: bitlockerFile });

    // ** หมายเหตุ: ตรรกะการลบไฟล์ในหน้า Edit ยังคงใช้ได้ แต่การอัปโหลดจะถูกย้ายไป **
    if (removeFile && isEditing) {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/assets/${formData.id}`,
        { bitlocker_file_url: null },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: formData,
  });

  const {
    fields: bitlockerFields,
    append: appendBitlockerKey,
    remove: removeBitlockerKey,
  } = useFieldArray({
    control,
    name: "bitlockerKeys",
  });

  const {
    fields: programFields,
    append: appendProgram,
    remove: removeProgram,
  } = useFieldArray({
    control,
    name: "specialPrograms",
  });

  // ---------- เตรียม options สำหรับ dropdown จาก masterData ----------
  const categoryOptions = useMemo(
    () => (masterData.category || []).map((v) => ({ value: v, label: v })),
    [masterData.category]
  );
  const subcategoryOptions = useMemo(
    () => (masterData.subcategory || []).map((v) => ({ value: v, label: v })),
    [masterData.subcategory]
  );
  const brandOptions = useMemo(
    () => (masterData.brand || []).map((v) => ({ value: v, label: v })),
    [masterData.brand]
  );
  const ramOptions = useMemo(
    () => (masterData.ram || []).map((v) => ({ value: v, label: v })),
    [masterData.ram]
  );
  const storageOptions = useMemo(
    () => (masterData.storage || []).map((v) => ({ value: v, label: v })),
    [masterData.storage]
  );
  const windowsOptions = useMemo(
    () => (masterData.windows || []).map((v) => ({ value: v, label: v })),
    [masterData.windows]
  );
  const officeOptions = useMemo(
    () => (masterData.office || []).map((v) => ({ value: v, label: v })),
    [masterData.office]
  );
  const antivirusOptions = useMemo(
    () => (masterData.antivirus || []).map((v) => ({ value: v, label: v })),
    [masterData.antivirus]
  );
  const specialProgramOptions = useMemo(
    () =>
      (masterData.special_program || []).map((v) => ({ value: v, label: v })),
    [masterData.special_program]
  );
  const userNameOptions = useMemo(
    () => (masterData.user_name || []).map((v) => ({ value: v, label: v })),
    [masterData.user_name]
  );
  const departmentOptions = useMemo(
    () => (masterData.department || []).map((v) => ({ value: v, label: v })),
    [masterData.department]
  );
  const locationOptions = useMemo(
    () => (masterData.location || []).map((v) => ({ value: v, label: v })),
    [masterData.location]
  );
  const wifiStatusOptions = useMemo(
    () => [
      { value: "NONE", label: "NONE" },
      { value: "Registered Korat", label: "Registered Korat" },
      { value: "Registered Nava", label: "Registered Nava" },
      { value: "Registered Nava & Korat", label: "Registered Nava & Korat" },
    ],
    []
  );
  const statusOptions = useMemo(
    () => [
      { value: "Enable", label: "Enable" },
      { value: "Disable", label: "Disable" },
      { value: "Replaced", label: "Replaced" },
    ],
    []
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? `Edit device : ${formData.asset_code}` : "Add device"}
          </h2>
          <p className="text-sm text-gray-500">
            Please complete all required fields.
          </p>
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
            <FormField label="IT Asset" error={errors.asset_code}>
              <input
                type="text"
                {...register("asset_code", {
                  required: "IT Asset is required.",
                })}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Category" error={errors.category}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <SearchableDropdown
                    options={categoryOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Category --"
                    idPrefix="dd-category"
                  />
                )}
              />
            </FormField>

            <FormField label="Subcategory">
              <Controller
                control={control}
                name="subcategory"
                render={({ field }) => (
                  <SearchableDropdown
                    options={subcategoryOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Subcategory --"
                    idPrefix="dd-subcategory"
                  />
                )}
              />
            </FormField>

            <FormField label="Brand">
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <SearchableDropdown
                    options={brandOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Brand --"
                    idPrefix="dd-brand"
                  />
                )}
              />
            </FormField>

            <FormField label="Model">
              <input
                type="text"
                {...register("model")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Serial Number">
              <input
                type="text"
                {...register("serial_number")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="CPU">
              <input
                type="text"
                {...register("cpu")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Memory (RAM)">
              <Controller
                control={control}
                name="ram"
                render={({ field }) => (
                  <SearchableDropdown
                    options={ramOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select RAM --"
                    idPrefix="dd-ram"
                  />
                )}
              />
            </FormField>

            <FormField label="Hard Disk">
              <Controller
                control={control}
                name="storage"
                render={({ field }) => (
                  <SearchableDropdown
                    options={storageOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Storage --"
                    idPrefix="dd-storage"
                  />
                )}
              />
            </FormField>
          </InfoCard>

          <InfoCard title="Network information">
            <FormField label="Device ID">
              <input
                type="text"
                {...register("device_id")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>
            <FormField label="IP Address">
              <input
                type="text"
                {...register("ip_address")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>
            <FormField label="Mac Address - LAN">
              <input
                type="text"
                {...register("mac_address_lan")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>
            <FormField label="Mac Address - WiFi">
              <input
                type="text"
                {...register("mac_address_wifi")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Status WiFi">
              <Controller
                control={control}
                name="wifi_registered"
                render={({ field }) => (
                  <SearchableDropdown
                    options={wifiStatusOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- WiFi Status --"
                    idPrefix="dd-wifi"
                  />
                )}
              />
            </FormField>
          </InfoCard>

          <InfoCard title="Software Information">
            <FormField label="Windows">
              <Controller
                control={control}
                name="windows_version"
                render={({ field }) => (
                  <SearchableDropdown
                    options={windowsOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Windows --"
                    idPrefix="dd-windows"
                  />
                )}
              />
            </FormField>

            <FormField label="Windows Product Key">
              <input
                type="text"
                {...register("windows_key")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Microsoft Office">
              <Controller
                control={control}
                name="office_version"
                render={({ field }) => (
                  <SearchableDropdown
                    options={officeOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Office Model --"
                    idPrefix="dd-office"
                  />
                )}
              />
            </FormField>

            <FormField label="Office Product Key">
              <input
                type="text"
                {...register("office_key")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Antivirus">
              <Controller
                control={control}
                name="antivirus"
                render={({ field }) => (
                  <SearchableDropdown
                    options={antivirusOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Antivirus Program --"
                    idPrefix="dd-antivirus"
                  />
                )}
              />
            </FormField>

            {/* Special Programs (array) */}
            <FormField label="Special Programs">
              <div className="space-y-2">
                {programFields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="grid grid-cols-1 md:grid-cols-10 gap-2 items-center"
                  >
                    {/* Dropdown Program Name */}
                    <div className="md:col-span-5">
                      <Controller
                        control={control}
                        name={`specialPrograms.${index}.program_name`}
                        render={({ field }) => (
                          <SearchableDropdown
                            options={specialProgramOptions}
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="-- Select Program --"
                            idPrefix={`dd-prog-${index}`}
                          />
                        )}
                      />
                    </div>

                    {/* License Key */}
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        {...register(`specialPrograms.${index}.license_key`)}
                        placeholder="Enter license key..."
                        className="p-2 border rounded-md w-full"
                      />
                    </div>

                    {/* Remove button */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeProgram(index)}
                        className="bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-600 transition"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    appendProgram({ program_name: "", license_key: "" })
                  }
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition mt-2"
                >
                  + Add Program
                </button>
              </div>
            </FormField>
          </InfoCard>

          <InfoCard title="BitLocker CSV File">
            {formData.bitlocker_file_url && !removeFile ? (
              <div className="bitlocker-section flex justify-between items-center">
                <a
                  href={`${process.env.REACT_APP_API_URL.replace("/api", "")}${
                    formData.bitlocker_file_url
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="bitlocker-link"
                >
                  Download current file
                </a>
                <button
                  type="button"
                  onClick={() => setRemoveFile(true)}
                  className="bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-red-600 transition"
                >
                  Delete file
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  className="bitlocker-input"
                  onChange={(e) => setBitlockerFile(e.target.files[0])}
                />
                {bitlockerFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setBitlockerFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="ยกเลิกไฟล์ที่เลือก"
                  >
                    ❌
                  </button>
                )}
              </div>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="Configuration and location">
            <FormField label="User">
              <Controller
                control={control}
                name="user_name"
                render={({ field }) => (
                  <SearchableDropdown
                    options={userNameOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select User --"
                    idPrefix="dd-user"
                  />
                )}
              />
            </FormField>

            <FormField label="User ID">
              <input
                type="text"
                {...register("user_id")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Department / Division">
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <SearchableDropdown
                    options={departmentOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Department --"
                    idPrefix="dd-dept"
                  />
                )}
              />
            </FormField>

            <FormField label="Location">
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <SearchableDropdown
                    options={locationOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Location --"
                    idPrefix="dd-location"
                  />
                )}
              />
            </FormField>
          </InfoCard>

          <InfoCard title="Management details">
            <FormField label="Status" error={errors.status}>
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required." }}
                render={({ field }) => (
                  <SearchableDropdown
                    options={statusOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="-- Select Status --"
                    idPrefix="dd-status"
                  />
                )}
              />
            </FormField>

            <FormField label="Start Date">
              <input
                type="date"
                {...register("start_date")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>

            <FormField label="Ref. FIN Asset No.">
              <input
                type="text"
                {...register("fin_asset_ref")}
                className="w-full p-2 border rounded-md"
              />
            </FormField>
          </InfoCard>
        </div>
      </div>
    </form>
  );
}

export default AssetForm;
