// ✅ UPDATED FILE — src/pages/EditAssetPage.js

import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import AssetForm from "../components/AssetForm";

function EditAssetPage() {
  const navigate = useNavigate();
  const { assetId } = useParams();

  const [formData, setFormData] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const requests = {
          asset: api.get(`/assets/${assetId}`),
          model: api.get("/models"),
          cpu: api.get("/cpus"),
          category: api.get("/categories"),
          subcategory: api.get("/subcategories"),
          brand: api.get("/brands"),
          ram: api.get("/rams"),
          storage: api.get("/storages"),
          department: api.get("/departments"),
          location: api.get("/locations"),
          status: api.get("/asset_statuses"),
          windows: api.get("/windows_versions"),
          office: api.get("/office_versions"),
          antivirus: api.get("/antivirus_programs"),
          special_program: api.get("/special-programs"),
          employees: api.get("/employees"),
        };

        const responses = await Promise.all(Object.values(requests));
        const responseData = Object.keys(requests).reduce((acc, key, index) => {
          acc[key] = responses[index].data;
          return acc;
        }, {});

        const fetchedMasterData = {
          model: responseData.model.map((item) => item.name),
          cpu: responseData.cpu.map((item) => item.name),
          category: responseData.category.map((item) => item.name),
          subcategory: responseData.subcategory.map((item) => item.name),
          brand: responseData.brand.map((item) => item.name),
          ram: responseData.ram.map((item) => item.size),
          storage: responseData.storage.map((item) => item.size),
          department: responseData.department.map((item) => item.name),
          location: responseData.location.map((item) => item.name),
          status: responseData.status.map((item) => item.name),
          windows: responseData.windows.map((item) => item.name),
          office: responseData.office.map((item) => item.name),
          antivirus: responseData.antivirus.map((item) => item.name),
          special_program: responseData.special_program,
          user_name: responseData.employees.map((emp) => emp.name),
        };
        setMasterData(fetchedMasterData);

        const asset = responseData.asset;

        setFormData({
          ...asset,
          start_date: asset.start_date
            ? new Date(asset.start_date).toISOString().split("T")[0]
            : "",
          specialPrograms: asset.specialPrograms || [],
          assignedIps: asset.assignedIps || [],
          // ✅ เพิ่มค่า default ถ้าไม่มีใน DB
          pa: asset.pa || "",
          prt: asset.prt || "",
          maintenance_start_date: asset.maintenance_start_date
            ? new Date(asset.maintenance_start_date).toISOString().split("T")[0]
            : "",
          maintenance_end_date: asset.maintenance_end_date
            ? new Date(asset.maintenance_end_date).toISOString().split("T")[0]
            : "",
          // ราคา ถ้า null ให้เป็น "" เพื่อให้ input แสดงว่าง
          maintenance_price: asset.maintenance_price ?? "",
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching data for edit page:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assetId]);

  const handleSubmit = async ({ data, file }) => {
    if (!data) return;

    const payload = { ...data };

    // ---- ปรับค่่าวันที่ให้เป็น null ถ้าเว้นว่าง ----
    const normalizeDate = (value) => {
      if (!value || String(value).trim() === "") return null;
      return value;
    };

    payload.start_date = normalizeDate(payload.start_date);
    payload.maintenance_start_date = normalizeDate(
      payload.maintenance_start_date
    );
    payload.maintenance_end_date = normalizeDate(payload.maintenance_end_date);

    // ---- ปรับราคาให้เป็น null หรือ number ----
    if (payload.maintenance_price === "" || payload.maintenance_price == null) {
      payload.maintenance_price = null;
    } else {
      payload.maintenance_price = Number(payload.maintenance_price);
    }

    try {
      await api.put(`/assets/${assetId}`, payload);

      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        await api.post(`/assets/${assetId}/upload-bitlocker`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Asset updated successfully!");
      navigate(`/asset/${assetId}`);
    } catch (error) {
      console.error("Error updating asset:", error);
      alert(error?.response?.data?.message || "Unable to update asset.");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!formData || !masterData)
    return <div className="p-4">No data found for editing.</div>;

  return (
    <AssetForm
      isEditing={true}
      formData={formData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/asset/${assetId}`)}
      masterData={masterData}
    />
  );
}

export default EditAssetPage;
