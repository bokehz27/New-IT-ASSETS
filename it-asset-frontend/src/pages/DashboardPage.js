import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Settings2,
  X,
} from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";

// ===== Button styles (match ReportPage) =====
const btnGradientBlue =
  "bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white font-bold py-2 px-4 rounded-lg shadow hover:opacity-90 transition inline-flex items-center gap-2";

const btnGradientGreen =
  "bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:opacity-90 transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

const btnGhost =
  "text-slate-600 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition";

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  // ฟิลด์ที่ใช้เช็กความสมบูรณ์ (ต้อง match กับ flattenAsset)
  const [availableFields] = useState([
    // ===================== Asset Identity =====================
    { key: "asset_name", label: "IT Asset" },
    { key: "serial_number", label: "Serial Number" },
    { key: "device_id", label: "Device ID" },
    { key: "fin_asset_ref_no", label: "Financial Asset Ref No." },
    { key: "pa", label: "PA" },
    { key: "prt", label: "PRT" },

    // ===================== Hardware & Spec =====================
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Subcategory" },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "cpu", label: "CPU" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },

    // ===================== Network =====================
    { key: "ip_address", label: "IP Address" }, // มาจาก join ตาราง IP
    { key: "mac_address_lan", label: "MAC Address (LAN)" },
    { key: "mac_address_wifi", label: "MAC Address (WiFi)" },
    { key: "wifi_status", label: "WiFi Status" },

    // ===================== Software & License =====================
    { key: "windows_version", label: "Windows Version" },
    { key: "windows_product_key", label: "Windows Product Key" },
    { key: "office_version", label: "Office Version" },
    { key: "office_product_key", label: "Office Product Key" },
    { key: "bitlocker_csv_file", label: "BitLocker CSV File" },
    { key: "antivirus", label: "Antivirus" },

    // ===================== User & Organization =====================
    { key: "user_id", label: "User Login" },
    { key: "user_name", label: "User Name" }, // field display จาก join employee/user
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },

    // ===================== Lifecycle & Maintenance =====================
    { key: "status", label: "Status" },
    { key: "start_date", label: "Start / Purchase Date" },
    { key: "end_date", label: "End / Warranty Date" },
    { key: "maintenance_start_date", label: "Maintenance Start Date" },
    { key: "maintenance_end_date", label: "Maintenance End Date" },
    { key: "maintenance_price", label: "Maintenance Price" },

    // ===================== Other Info =====================
    { key: "remark", label: "Remark" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ]);

  // เงื่อนไขจริง ๆ ที่ดึงจาก backend
  const [defaultRequiredFields, setDefaultRequiredFields] = useState([]);
  const [categoryRules, setCategoryRules] = useState([]); // [{category_id, required_fields: []}]
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // สำหรับ settings modal (แก้ทีเดียวทุก Category)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDefaultRequired, setSettingsDefaultRequired] = useState([]);
  const [settingsRulesByCategory, setSettingsRulesByCategory] = useState({});
  const [settingsUseDefaultByCategory, setSettingsUseDefaultByCategory] =
    useState({});
  const [settingsExpandedCategories, setSettingsExpandedCategories] = useState(
    []
  );
  const [settingsError, setSettingsError] = useState("");

  const fallbackDefaultRequired = useMemo(
    () => [
      "asset_name",
      "serial_number",
      "user_name",
      "department",
      "location",
    ],
    []
  );

  // โหลด Categories + เงื่อนไขจาก backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, ruleRes] = await Promise.all([
          api.get("/assets/meta/categories"), // 👈 เปลี่ยนมาใช้ meta endpoint ใหม่
          api.get("/assets/meta/completeness-rules"),
        ]);

        setCategories(catRes.data || []);

        const { default_required_fields, category_rules } = ruleRes.data || {};
        setDefaultRequiredFields(
          Array.isArray(default_required_fields) ? default_required_fields : []
        );
        setCategoryRules(Array.isArray(category_rules) ? category_rules : []);
      } catch (e) {
        console.error("Failed to load dashboard initial data", e);
      }
    };

    fetchData();
  }, []);

  // หาเงื่อนไขที่ใช้จริงสำหรับ Category หนึ่ง ๆ
  const getRuleForCategory = (categoryId) => {
    const baseRule =
      Array.isArray(defaultRequiredFields) && defaultRequiredFields.length
        ? defaultRequiredFields
        : fallbackDefaultRequired;

    if (!categoryId || categoryId === "all") return baseRule;

    const found = categoryRules.find(
      (r) => String(r.category_id) === String(categoryId)
    );
    if (
      found &&
      Array.isArray(found.required_fields) &&
      found.required_fields.length
    ) {
      return found.required_fields;
    }
    return baseRule;
  };

  // auto-run รอบแรกเมื่อโหลดเงื่อนไขเสร็จ
  const [hasInitRun, setHasInitRun] = useState(false);
  useEffect(() => {
    if (!hasInitRun && (defaultRequiredFields.length || categoryRules.length)) {
      handleCheckCompleteness();
      setHasInitRun(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRequiredFields, categoryRules]);

  const handleCheckCompleteness = async () => {
    setError("");

    const requiredKeys = getRuleForCategory(selectedCategoryId);

    if (!requiredKeys || requiredKeys.length === 0) {
      setError(
        "ยังไม่ได้ตั้งค่าฟิลด์ที่ต้องการให้เป็นฟิลด์บังคับ\nกรุณากด 'ตั้งค่าเงื่อนไข' แล้วกำหนดฟิลด์ก่อน"
      );
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        required_fields: requiredKeys.join(","),
      };
      if (selectedCategoryId && selectedCategoryId !== "all") {
        params.category_id = selectedCategoryId;
      }

      const res = await api.get("/assets/stats/incomplete-assets", { params });
      setStats(res.data);
    } catch (e) {
      console.error("Failed to calculate completeness stats", e);
      setError(
        "ไม่สามารถดึงข้อมูลสถิติได้ กรุณาตรวจสอบ API /assets/stats/incomplete-assets"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssets = stats?.total_assets ?? 0;
  const incompleteCount = stats?.incomplete_count ?? 0;
  const completenessPercent =
    totalAssets > 0
      ? Math.round(((totalAssets - incompleteCount) / totalAssets) * 100)
      : 0;

  // ---------- SETTINGS MODAL (กำหนดทุก Category ทีเดียว) ----------

  const openSettings = () => {
    setSettingsError("");

    // default rule ที่ใช้ใน modal (ถ้ายังไม่มี ให้ใช้ fallback)
    const initialDefault =
      Array.isArray(defaultRequiredFields) && defaultRequiredFields.length
        ? defaultRequiredFields
        : fallbackDefaultRequired;

    setSettingsDefaultRequired(initialDefault);

    const rulesByCat = {};
    const useDefaultByCat = {};

    categories.forEach((c) => {
      const found = categoryRules.find(
        (r) => String(r.category_id) === String(c.id)
      );
      if (
        found &&
        Array.isArray(found.required_fields) &&
        found.required_fields.length
      ) {
        rulesByCat[c.id] = found.required_fields;
        useDefaultByCat[c.id] = false;
      } else {
        // ยังไม่มีเงื่อนไขเฉพาะ → ใช้ default
        rulesByCat[c.id] = initialDefault;
        useDefaultByCat[c.id] = true;
      }
    });

    setSettingsRulesByCategory(rulesByCat);
    setSettingsUseDefaultByCategory(useDefaultByCat);
    setSettingsExpandedCategories([]); // เริ่มต้นยังไม่ขยายอันไหน
    setIsSettingsOpen(true);
  };

  const toggleSettingsDefaultField = (key) => {
    setSettingsDefaultRequired((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSettingsCategoryExpand = (categoryId) => {
    setSettingsExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const setCategoryUseMode = (categoryId, useDefault) => {
    setSettingsUseDefaultByCategory((prev) => ({
      ...prev,
      [categoryId]: useDefault,
    }));

    setSettingsRulesByCategory((prev) => {
      const current = prev[categoryId] || [];
      if (useDefault) {
        // ใช้ default → แค่ให้ UI แสดง แต่เวลาบันทึกเราจะส่ง [] เพื่อให้ลบ rule
        return { ...prev, [categoryId]: current };
      } else {
        // สลับมา custom ถ้ายังไม่มีอะไร ให้เริ่มจาก default ปัจจุบัน
        const initial =
          current && current.length ? current : settingsDefaultRequired;
        return { ...prev, [categoryId]: initial };
      }
    });
  };

  const toggleSettingsCategoryField = (categoryId, fieldKey) => {
    setSettingsRulesByCategory((prev) => {
      const current = prev[categoryId] || [];
      const next = current.includes(fieldKey)
        ? current.filter((k) => k !== fieldKey)
        : [...current, fieldKey];
      return { ...prev, [categoryId]: next };
    });
  };

  const handleSaveAllRules = async () => {
    setSettingsError("");

    // ยังใช้ default rule อยู่ (สำหรับ fallback / ใช้กับ asset ที่ไม่มี rule เฉพาะ)
    if (!settingsDefaultRequired.length) {
      setSettingsError("Default rule ต้องมีฟิลด์บังคับอย่างน้อย 1 ฟิลด์");
      return;
    }

    // ✅ ทุก Category ต้องมีฟิลด์บังคับอย่างน้อย 1 ฟิลด์
    for (const c of categories) {
      const fields = settingsRulesByCategory[c.id] || [];
      if (!fields.length) {
        setSettingsError(
          `Category "${c.name}" ต้องมีฟิลด์บังคับอย่างน้อย 1 ฟิลด์`
        );
        return;
      }
    }

    try {
      const requests = [];

      // ✅ เซฟ Default rule (ไว้เป็น fallback)
      requests.push(
        api.put("/assets/meta/completeness-rules", {
          category_id: null,
          required_fields: settingsDefaultRequired,
        })
      );

      // ✅ เซฟเงื่อนไขของทุก Category เป็น custom rule ตาม fields ที่เลือก
      categories.forEach((c) => {
        const fields = settingsRulesByCategory[c.id] || [];

        requests.push(
          api.put("/assets/meta/completeness-rules", {
            category_id: c.id,
            required_fields: fields,
          })
        );
      });

      await Promise.all(requests);

      // โหลดเงื่อนไขใหม่มาเก็บใน state หลัก
      const ruleRes = await api.get("/assets/meta/completeness-rules");
      const { default_required_fields, category_rules } = ruleRes.data || {};
      setDefaultRequiredFields(
        Array.isArray(default_required_fields) ? default_required_fields : []
      );
      setCategoryRules(Array.isArray(category_rules) ? category_rules : []);

      setIsSettingsOpen(false);

      // รันคำนวณใหม่ตามเงื่อนไขที่เพิ่งบันทึก
      await handleCheckCompleteness();
    } catch (e) {
      console.error("Failed to save completeness rules", e);
      setSettingsError(
        "บันทึกเงื่อนไขความสมบูรณ์ไม่สำเร็จ กรุณาตรวจสอบ API /assets/completeness-rules"
      );
    }
  };

  const renderSettingsModal = () => {
    if (!isSettingsOpen) return null;

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-3 md:px-4">
        <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="relative border-b border-slate-200 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 px-4 py-3.5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-900/30 px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase">
                  <Settings2 className="h-3 w-3" />
                  Completeness Rules
                </div>
                <h2 className="mt-1 text-sm font-semibold">
                  ตั้งค่าเงื่อนไขความสมบูรณ์ของข้อมูล Asset
                </h2>
                <p className="mt-0.5 text-[11px] text-sky-50/90">
                  กำหนดฟิลด์บังคับสำหรับทุก Category และตั้งค่าเงื่อนไขเฉพาะราย
                  Category ได้ในหน้าต่างเดียว
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="inline-flex items-center gap-1 rounded-full bg-sky-900/30 px-2.5 py-1 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  ใช้งานอยู่ใน Dashboard นี้
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="mt-1 rounded-full bg-sky-900/40 p-1.5 text-sky-50 hover:bg-sky-900/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 px-4 py-4 text-xs">
            {/* ขวา: Category rules */}
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-slate-800">
                    เงื่อนไขต่อ Category
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    เลือกว่าแต่ละ Category จะใช้ Default rule หรือกำหนดฟิลด์เอง
                  </p>
                </div>
                <div className="hidden text-[10px] text-slate-500 md:block">
                  รวมทั้งหมด{" "}
                  <span className="font-semibold text-slate-700">
                    {categories.length}
                  </span>{" "}
                  Category
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60">
                {categories.map((c) => {
                  const fields = settingsRulesByCategory[c.id] || [];
                  const expanded = settingsExpandedCategories.includes(c.id);
                  const selectedCount = fields.length;

                  return (
                    <div
                      key={c.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[12px] font-medium text-slate-800">
                              {c.name}
                            </p>
                            <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2 py-[2px] text-[10px] text-slate-600">
                              Custom rule
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            ฟิลด์บังคับที่ใช้การตรวจสอบ{" "}
                            <span className="font-semibold text-sky-700">
                              {selectedCount} ฟิลด์
                            </span>
                          </p>

                          {fields.length > 0 && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                              ตัวอย่างฟิลด์:{" "}
                              <span className="font-medium">
                                {fields
                                  .slice(0, 4)
                                  .map(
                                    (key) =>
                                      availableFields.find((f) => f.key === key)
                                        ?.label || key
                                  )
                                  .join(", ")}
                                {fields.length > 4 ? " …" : ""}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSettingsCategoryExpand(c.id)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 shadow-sm hover:bg-slate-100"
                          >
                            {expanded ? "ซ่อนรายละเอียด" : "กำหนดฟิลด์"}
                          </button>
                        </div>
                      </div>

                      {/* ส่วนกำหนดฟิลด์ */}
                      {expanded && (
                        <div className="border-t border-slate-100 bg-white px-3 py-2.5">
                          <p className="mb-1 text-[11px] text-slate-600">
                            เลือกฟิลด์บังคับสำหรับ Category นี้
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableFields.map((field) => {
                              const checked = fields.includes(field.key);
                              return (
                                <button
                                  key={field.key}
                                  type="button"
                                  onClick={() =>
                                    toggleSettingsCategoryField(c.id, field.key)
                                  }
                                  className={`inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] transition ${
                                    checked
                                      ? "border-sky-500 bg-sky-50 text-sky-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                  {field.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error & Footer buttons */}
          {settingsError && (
            <div className="px-4 pb-1 text-[11px] text-rose-600">
              {settingsError}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
            <p className="hidden text-[11px] text-slate-500 md:block">
              การเปลี่ยนแปลงนี้จะมีผลต่อการคำนวณ{" "}
              <span className="font-medium text-slate-700">
                Data completeness
              </span>{" "}
              บน Dashboard ทันที
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={btnGhost}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveAllRules}
                className={btnGradientBlue}
              >
                <Settings2 className="h-4 w-4" />
                บันทึกเงื่อนไขทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- RENDER MAIN DASHBOARD ----------

  return (
    <div className="min-h-[calc(100vh-120px)] bg-slate-50 px-4 py-6 md:px-8">
      {renderSettingsModal()}

      {/* Top header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            IT Asset Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ตรวจสอบความสมบูรณ์ของข้อมูล IT Assets และตามเก็บข้อมูลที่ยังขาดหายไป
          </p>
          <div className="mt-2 inline-flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              ฟิลด์บังคับจากเงื่อนไขล่าสุด
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              Category:{" "}
              {selectedCategoryId === "all"
                ? "ทุก Category"
                : categories.find(
                    (c) => String(c.id) === String(selectedCategoryId)
                  )?.name || "เลือก Category"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openSettings}
            className={btnGradientBlue}
          >
            <Settings2 className="h-4 w-4" />
            ตั้งค่าเงื่อนไขความสมบูรณ์
          </button>

          {/*<button
  type="button"
  onClick={handleCheckCompleteness}
  disabled={isLoading}
  className={btnGradientGreen}
>
  {isLoading ? "กำลังคำนวณ..." : <>
    <AlertTriangle className="h-4 w-4" />
    ตรวจสอบตอนนี้
  </>}
</button> */}
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Card 1: Incomplete assets */}
        {/* Card 1: Incomplete assets (Critical style) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-red-500 p-4 text-white shadow-sm">
          {/* soft overlay */}
          <div className="absolute inset-0 opacity-15 mix-blend-soft-light" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-rose-50/90">
                Assets with incomplete data
              </p>

              <p className="mt-2 text-3xl font-semibold">{incompleteCount}</p>

              <p className="mt-1 text-[11px] text-rose-50/90">
                จำนวน Asset ที่ข้อมูลไม่ครบตามฟิลด์บังคับ
              </p>

              {totalAssets > 0 && (
                <p className="mt-1 text-[11px] text-rose-100/90">
                  คิดเป็น{" "}
                  <span className="font-semibold">
                    {Math.round((incompleteCount / totalAssets) * 100)}%
                  </span>{" "}
                  ของทั้งหมด
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>

              <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-[3px] text-[10px] font-medium text-white">
                ต้องแก้ไขด่วน
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Completeness */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-500 via-emerald-500 to-sky-500 p-4 text-white shadow-sm">
          <div className="absolute inset-0 opacity-10 mix-blend-soft-light" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-50/90">
                Data completeness
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {completenessPercent}%
              </p>
              <p className="mt-1 text-[11px] text-emerald-50/90">
                {(totalAssets || 0).toLocaleString("en-US")} assets ทั้งหมด
                ในช่วงตัวกรองปัจจุบัน
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-emerald-100/30">
                <div
                  className="h-2 rounded-full bg-white/90"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50/20">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detail & table section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              สรุปความสมบูรณ์ของข้อมูล Assets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              ระบบจะค้นหา Asset ที่ฟิลด์บังคับเป็นค่าว่างตาม Category
              และเงื่อนไขที่คุณเลือก เพื่อช่วยให้ตามเก็บข้อมูลได้ครบถ้วน
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {stats ? (
          <>
            {/* Small stats row */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">
                  Total assets (ตามตัวกรอง)
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {totalAssets.toLocaleString("en-US")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">
                  Incomplete assets
                </p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">
                  {incompleteCount.toLocaleString("en-US")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">
                  Required fields missing (summary)
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {stats.counts_by_field &&
                    Object.entries(stats.counts_by_field).map(
                      ([key, count]) => {
                        const label =
                          availableFields.find((f) => f.key === key)?.label ||
                          key;
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2 py-[2px] text-[10px] text-amber-700"
                          >
                            {label}: {count}
                          </span>
                        );
                      }
                    )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-800">
                  รายการตัวอย่าง Asset ที่ข้อมูลยังไม่ครบ{" "}
                  <span className="text-xs font-normal text-slate-500">
                    (แสดงสูงสุด 50 รายการ)
                  </span>
                </h3>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-72 overflow-y-auto bg-white text-xs">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">
                          ID
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">
                          IT Asset
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">
                          Category
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500">
                          Missing fields
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.assets && stats.assets.length > 0 ? (
                        stats.assets.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-slate-600">{a.id}</td>
                            <td className="px-3 py-2 text-slate-800">
                              {a.asset_name ? (
                                <Link
                                  to={`/asset/${a.id}`}
                                  className="text-sky-700 hover:text-sky-900 hover:underline"
                                >
                                  {a.asset_name}
                                </Link>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {a.category_name || "-"}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {a.missing_fields &&
                              a.missing_fields.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {a.missing_fields.map((key) => {
                                    const label =
                                      availableFields.find((f) => f.key === key)
                                        ?.label || key;
                                    return (
                                      <span
                                        key={key}
                                        className="inline-flex rounded-full bg-rose-50 px-2 py-[1px] text-[10px] text-rose-700"
                                      >
                                        {label}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-4 text-center text-slate-400"
                          >
                            ไม่พบข้อมูล Asset ที่ไม่ครบตามเงื่อนไข
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-xs text-slate-500">
            ยังไม่ได้คำนวณความสมบูรณ์ของข้อมูล
            <br />
            <span className="text-slate-400">
              กด "ตรวจสอบตอนนี้" เพื่อคำนวณจากเงื่อนไขปัจจุบัน
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
