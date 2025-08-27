// src/components/AssetForm.js

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";

// --- คอมโพเนนต์ย่อยสำหรับการจัดวางฟอร์ม (ปรับปรุงเล็กน้อยเพื่อแสดง error) ---
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


// --- คอมโพเนนต์หลักของฟอร์ม (ฉบับปรับปรุง) ---
function AssetForm({ isEditing, formData, onSubmit, onCancel, masterData }) {
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? `Edit device : ${formData.asset_code}` : "Add device"}
                    </h2>
                    <p className="text-sm text-gray-500">Please complete all required fields.</p>
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
                                {...register("asset_code", { required: "IT Asset is required." })}
                                className="w-full p-2 border rounded-md"
                            />
                        </FormField>
                        <FormField label="Category" error={errors.category}>
                            <select {...register("category")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Category --</option>
                                {masterData.category.map((c) => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </FormField>
                         <FormField label="Subcategory">
                            <select {...register("subcategory")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Subcategory --</option>
                                {masterData.subcategory.map((sc) => (<option key={sc} value={sc}>{sc}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Brand">
                            <select {...register("brand")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Brand --</option>
                                {masterData.brand.map((b) => (<option key={b} value={b}>{b}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Model">
                            <input type="text" {...register("model")} className="w-full p-2 border rounded-md" />
                        </FormField>
                        <FormField label="Serial Number">
                             <input type="text" {...register("serial_number")} className="w-full p-2 border rounded-md" />
                        </FormField>
                        <FormField label="CPU">
                            <input type="text" {...register("cpu")} className="w-full p-2 border rounded-md" />
                        </FormField>
                        <FormField label="Memory (RAM)">
                            <select {...register("ram")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Ram --</option>
                                {masterData.ram.map((r) => (<option key={r} value={r}>{r}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Hard Disk">
                            <select {...register("storage")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Storage --</option>
                                {masterData.storage.map((s) => (<option key={s} value={s}>{s}</option>))}
                            </select>
                        </FormField>
                    </InfoCard>

                     <InfoCard title="Network information">
                        <FormField label="Device ID">
                            <input type="text" {...register("device_id")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="IP Address">
                            <input type="text" {...register("ip_address")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="Mac Address - LAN">
                            <input type="text" {...register("mac_address_lan")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="Mac Address - WiFi">
                            <input type="text" {...register("mac_address_wifi")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="Status WiFi">
                            <select {...register("wifi_registered")} className="w-full p-2 border rounded-md">
                                <option value="Wifi not register">Not Registered</option>
                                <option value="Wifi ok">Registered</option>
                            </select>
                        </FormField>
                    </InfoCard>

                    <InfoCard title="Software Information">
                       <FormField label="Windows">
                            <select {...register("windows_version")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Windows --</option>
                                {(masterData.windows || []).map((w) => (<option key={w} value={w}>{w}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Windows Product Key">
                            <input type="text" {...register("windows_key")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="Microsoft Office">
                            <select {...register("office_version")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Office Model --</option>
                                {(masterData.office || []).map((o) => (<option key={o} value={o}>{o}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Office Product Key">
                            <input type="text" {...register("office_key")} className="w-full p-2 border rounded-md"/>
                        </FormField>
                        <FormField label="Antivirus">
                            <select {...register("antivirus")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Antivirus Program --</option>
                                {(masterData.antivirus || []).map((av) => (<option key={av} value={av}>{av}</option>))}
                            </select>
                        </FormField>
                        {/* --- (แก้ไข) ส่วนของ Special Programs ทั้งหมด --- */}
                        <FormField label="Special Programs">
                            <div className="space-y-2">
                                {programFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-center">
                                        {/* Dropdown สำหรับเลือกโปรแกรม */}
                                        <div className="md:col-span-5">
                                            <select
                                                {...register(`specialPrograms.${index}.program_name`)}
                                                className="p-2 border rounded-md w-full"
                                            >
                                                <option value="">-- Select Program --</option>
                                                {(masterData.special_program || []).map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Input สำหรับกรอก Key */}
                                        <div className="md:col-span-4">
                                            <input
                                                type="text"
                                                {...register(`specialPrograms.${index}.license_key`)}
                                                placeholder="Enter license key..."
                                                className="p-2 border rounded-md w-full"
                                            />
                                        </div>

                                        {/* ปุ่มลบ */}
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
                                    onClick={() => appendProgram({ program_name: "", license_key: "" })}
                                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition mt-2"
                                >
                                    + Add Program
                                </button>
                            </div>
                        </FormField>
                         {/* --- (สิ้นสุด) ส่วนที่แก้ไข --- */}
                    </InfoCard>

                    <InfoCard title="BitLocker Recovery Keys">
                        {bitlockerFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-start">
                                <div className="md:col-span-3">
                                    <input
                                        type="text"
                                        {...register(`bitlockerKeys.${index}.drive_name`, { required: "Drive is required." })}
                                        placeholder="Drive (e.g., C:)"
                                        className="p-2 border rounded-md w-full"
                                    />
                                     {errors.bitlockerKeys?.[index]?.drive_name && <p className="text-red-500 text-xs mt-1">{errors.bitlockerKeys[index].drive_name.message}</p>}
                                </div>
                               <div className="md:col-span-6">
                                    <input
                                        type="text"
                                        {...register(`bitlockerKeys.${index}.recovery_key`, { required: "Key is required." })}
                                        placeholder="48-digit Recovery Key"
                                        className="p-2 border rounded-md w-full"
                                    />
                                    {errors.bitlockerKeys?.[index]?.recovery_key && <p className="text-red-500 text-xs mt-1">{errors.bitlockerKeys[index].recovery_key.message}</p>}
                               </div>
                                <div className="md:col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeBitlockerKey(index)}
                                        className="bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-600 transition"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => appendBitlockerKey({ drive_name: "", recovery_key: "" })}
                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition mt-2"
                        >
                            + Add Key
                        </button>
                    </InfoCard>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title="Configuration and location">
                        <FormField label="User">
                            <select {...register("user_name")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select User --</option>
                                {masterData.user_name.map((name) => (<option key={name} value={name}>{name}</option>))}
                            </select>
                        </FormField>
                        <FormField label="User ID">
                            <input type="text" {...register("user_id")} className="w-full p-2 border rounded-md" />
                        </FormField>
                        <FormField label="Department / Division">
                            <select {...register("department")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Department --</option>
                                {masterData.department.map((d) => (<option key={d} value={d}>{d}</option>))}
                            </select>
                        </FormField>
                        <FormField label="Location">
                            <select {...register("location")} className="w-full p-2 border rounded-md">
                                <option value="">-- Select Location --</option>
                                {masterData.location.map((l) => (<option key={l} value={l}>{l}</option>))}
                            </select>
                        </FormField>
                    </InfoCard>

                    <InfoCard title="Management details">
                        <FormField label="Status" error={errors.status}>
                            <select
                                {...register("status", { required: "Status is required." })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">-- Select Status --</option>
                                <option value="Enable">Enable</option>
                                <option value="Disable">Disable</option>
                            </select>
                        </FormField>
                        <FormField label="Start Date">
                           <input
                                type="date"
                                {...register("start_date")}
                                className="w-full p-2 border rounded-md"
                            />
                        </FormField>
                        <FormField label="Ref. FIN Asset No.">
                            <input type="text" {...register("fin_asset_ref")} className="w-full p-2 border rounded-md" />
                        </FormField>
                    </InfoCard>
                </div>
            </div>
        </form>
    );
}

export default AssetForm;