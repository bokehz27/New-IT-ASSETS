// ✅ UPDATED FILE — src/components/AssetForm.js
import React, { useMemo, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import SearchableDropdown from "./SearchableDropdown";
import IpAssignmentForm from "./IpAssignmentForm";
import SpecialProgramsForm from "./SpecialProgramsForm";
import { Button } from "primereact/button";

// --- Sub-components (InfoCard, FormField) ---
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

// --- Main Form Component ---
function AssetForm({ isEditing, formData, onSubmit, onCancel, masterData }) {
  const [bitlockerFile, setBitlockerFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: formData,
  });

  const {
    fields: programFields,
    append: appendProgram,
    remove: removeProgram,
  } = useFieldArray({
    control,
    name: "specialPrograms",
  });

  const [assignedIpIds, setAssignedIpIds] = useState(
    formData.assignedIps?.map((ip) => ip.id) || []
  );

  const handleFormSubmit = async (data) => {
    await onSubmit({
      data: { ...data, ip_ids: assignedIpIds },
      file: bitlockerFile,
      removeFile,
    });
  };

  // --- Prepare Dropdown Options ---
  const modelOptions = useMemo(
    () => (masterData.model || []).map((v) => ({ value: v, label: v })),
    [masterData.model]
  );
  const cpuOptions = useMemo(
    () => (masterData.cpu || []).map((v) => ({ value: v, label: v })),
    [masterData.cpu]
  );
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
  const departmentOptions = useMemo(
    () => (masterData.department || []).map((v) => ({ value: v, label: v })),
    [masterData.department]
  );
  const locationOptions = useMemo(
    () => (masterData.location || []).map((v) => ({ value: v, label: v })),
    [masterData.location]
  );
  const statusOptions = useMemo(
    () => (masterData.status || []).map((v) => ({ value: v, label: v })),
    [masterData.status]
  );
  const userNameOptions = useMemo(
    () => (masterData.user_name || []).map((v) => ({ value: v, label: v })),
    [masterData.user_name]
  );
  const specialProgramOptions = useMemo(
    () =>
      (masterData.special_program || []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [masterData.special_program]
  );

  const wifiStatusOptions = [
    { value: "Registered Nava-Korat", label: "Registered Nava-Korat" },
    { value: "Registered Korat", label: "Registered Korat" },
    { value: "Registered Nava", label: "Registered Nava" },
    { value: "NONE", label: "NONE" },
  ];

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? (
              <>
                Edit device :{" "}
                <span className="text-blue-600">
                  {watch("asset_name") || "-"}
                </span>
              </>
            ) : (
              "Add device"
            )}
          </h2>
          <p className="text-sm text-gray-500">
            Please complete all required fields.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* --- Hardware specifications --- */}
          <InfoCard title="Hardware specifications">
            <FormField label="Asset Name" error={errors.asset_name}>
              <input
                type="text"
                {...register("asset_name", {
                  required: "Asset Name is required",
                })}
                className="w-full input-text"
              />
            </FormField>
            <FormField label="Serial Number" error={errors.serial_number}>
              <input
                type="text"
                {...register("serial_number")}
                className="w-full input-text"
              />
            </FormField>

            <FormField label="Category" error={errors.category}>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <SearchableDropdown
                    options={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Subcategory" error={errors.subcategory}>
              <Controller
                name="subcategory"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={subcategoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Brand" error={errors.brand}>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={brandOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Model" error={errors.model}>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={modelOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            {/* ✅ CPU / RAM / STORAGE */}
            <FormField label="CPU" error={errors.cpu}>
              <Controller
                name="cpu"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={cpuOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Memory (RAM)" error={errors.ram}>
              <Controller
                name="ram"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={ramOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Hard Disk" error={errors.storage}>
              <Controller
                name="storage"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={storageOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </InfoCard>

          {/* --- Network information --- */}
          <InfoCard title="Network information">
            <FormField label="Device ID" error={errors.device_id}>
              <input
                type="text"
                {...register("device_id")}
                className="w-full"
              />
            </FormField>
            <FormField label="Mac Address - LAN" error={errors.mac_address_lan}>
              <input
                type="text"
                {...register("mac_address_lan")}
                className="w-full"
              />
            </FormField>
            <FormField
              label="Mac Address - WiFi"
              error={errors.mac_address_wifi}
            >
              <input
                type="text"
                {...register("mac_address_wifi")}
                className="w-full"
              />
            </FormField>
            <FormField label="Status WiFi" error={errors.wifi_status}>
              <Controller
                name="wifi_status"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={wifiStatusOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
            <IpAssignmentForm
              initialAssignedIps={formData.assignedIps}
              onChange={setAssignedIpIds}
            />
          </InfoCard>

          {/* --- Software Information --- */}
          <InfoCard title="Software Information">
            <FormField label="Windows" error={errors.windows_version}>
              <Controller
                name="windows_version"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={windowsOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Windows Product Key"
              error={errors.windows_product_key}
            >
              <input
                type="text"
                {...register("windows_product_key")}
                className="w-full"
              />
            </FormField>

            <FormField label="Office" error={errors.office_version}>
              <Controller
                name="office_version"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={officeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Office Product Key"
              error={errors.office_product_key}
            >
              <input
                type="text"
                {...register("office_product_key")}
                className="w-full"
              />
            </FormField>
            <FormField label="Antivirus" error={errors.antivirus}>
              <Controller
                name="antivirus"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={antivirusOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            {/* --- Special Programs Section --- */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Special Programs
              </label>
              {programFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center mb-2">
                  <Controller
                    name={`specialPrograms.${index}.program_id`}
                    control={control}
                    render={({ field }) => (
                      <SearchableDropdown
                        options={specialProgramOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Program Name"
                      />
                    )}
                  />
                  <input
                    {...register(`specialPrograms.${index}.license_key`)}
                    placeholder="License Key"
                    className="flex-grow w-full p-2 border rounded-md"
                  />
                  <Button
                    type="button"
                    icon="pi pi-times-circle"
                    className="p-button-rounded p-button-danger p-button-text"
                    tooltip="Remove Program"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => removeProgram(index)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  appendProgram({ program_id: "", license_key: "" })
                }
                className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90"
              >
                Add Program
              </button>
            </div>
          </InfoCard>

          {/* --- BitLocker CSV Upload --- */}
          <InfoCard title="BitLocker CSV File">
            {isEditing && formData.bitlocker_csv_file && !removeFile ? (
              <div className="flex justify-between items-center">
                <a
                  href={`${process.env.REACT_APP_API_URL.replace("/api", "")}${
                    formData.bitlocker_csv_file
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download current file
                </a>
                <button
                  type="button"
                  onClick={() => setRemoveFile(true)}
                  className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                >
                  Replace File
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv, application/vnd.ms-excel"
                  ref={fileInputRef}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                    title="Cancel selected file"
                  >
                    ❌
                  </button>
                )}
              </div>
            )}
          </InfoCard>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="For Printer">
            <FormField label="PA">
              <input type="text" {...register("pa")} className="w-full" />
            </FormField>
            <FormField label="PRT">
              <input type="text" {...register("prt")} className="w-full" />
            </FormField>
          </InfoCard>

          {/* --- Configuration and location --- */}
          <InfoCard title="Configuration and location">
            <FormField label="User Name" error={errors.user_name}>
              <Controller
                name="user_name"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={userNameOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="User ID" error={errors.user_id}>
              <input type="text" {...register("user_id")} className="w-full" />
            </FormField>

            <FormField label="Department" error={errors.department}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={departmentOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Location" error={errors.location}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={locationOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </InfoCard>

          {/* --- Management details --- */}
          <InfoCard title="Management details">
            <FormField label="Status" error={errors.status}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SearchableDropdown
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Start Date" error={errors.start_date}>
              <input
                type="date"
                {...register("start_date")}
                className="w-full"
              />
            </FormField>

            <FormField
              label="Ref. FIN Asset No."
              error={errors.fin_asset_ref_no}
            >
              <input
                type="text"
                {...register("fin_asset_ref_no")}
                className="w-full"
              />
            </FormField>

            <FormField label="Remark" error={errors.remark}>
              <textarea
                {...register("remark")}
                className="w-full"
                rows="3"
              ></textarea>
            </FormField>
          </InfoCard>

          <InfoCard title="Maintenance">
            <FormField
              label="Start Maintenance Date"
              error={errors.maintenance_start_date}
            >
              <input
                type="date"
                {...register("maintenance_start_date")}
                className="w-full input-text"
              />
            </FormField>

            <FormField
              label="End Maintenance Date"
              error={errors.maintenance_end_date}
            >
              <input
                type="date"
                {...register("maintenance_end_date")}
                className="w-full input-text"
              />
            </FormField>

            <FormField
              label="Maintenance Price (THB)"
              error={errors.maintenance_price}
            >
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("maintenance_price")}
                className="w-full input-text"
                placeholder="0.00"
              />
            </FormField>
          </InfoCard>
        </div>
      </div>
    </form>
  );
}

export default AssetForm;
