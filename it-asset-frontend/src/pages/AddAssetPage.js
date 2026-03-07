import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssetForm from "../components/AssetForm";
import api from "../api";

function AddAssetPage() {
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData] = useState({
    asset_name: "",
    user_id: "",
    serial_number: "",
    device_id: "",
    mac_address_lan: "",
    mac_address_wifi: "",
    wifi_status: "",
    windows_product_key: "",
    office_product_key: "",
    start_date: "",
    end_date: null,
    fin_asset_ref_no: "",
    remark: "",
    status: "Enable",
    specialPrograms: [],
    ip_ids: [],

    // ✅ Hardware / general info
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    ram: "",
    cpu: "",
    storage: "",
    windows_version: "",
    office_version: "",
    antivirus: "",
    user_name: "",
    department: "",
    location: "",
    pa: "",
    prt: "",
    maintenance_start_date: "",
    maintenance_end_date: "",
    maintenance_price: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const requests = {
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
      } catch (error) {
        console.error("Failed to fetch initial data for the form:", error);
        alert(
          "Error: Could not load data for the form. Please check the API connection and refresh the page.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async ({ data, file }) => {
    try {
      const payload = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        maintenance_start_date: data.maintenance_start_date || null,
        maintenance_end_date: data.maintenance_end_date || null,
        maintenance_price: data.maintenance_price
          ? parseFloat(data.maintenance_price)
          : null,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        model_id: data.model_id || null,
        cpu_id: data.cpu_id || null,
        ram_id: data.ram_id || null,
        storage_id: data.storage_id || null,
        status_id: data.status_id || null,
        department_id: data.department_id || null,
        location_id: data.location_id || null,
        windows_version_id: data.windows_version_id || null,
        office_version_id: data.office_version_id || null,
        antivirus_id: data.antivirus_id || null,
        employee_id: data.employee_id || null,
      };

      const response = await api.post("/assets", payload);
      const newAssetId = response.data.id;

      if (file && newAssetId) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        await api.post(
          `/assets/${newAssetId}/upload-bitlocker`,
          formDataUpload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      alert("New asset added successfully!");
      navigate("/assets");
    } catch (error) {
      console.error("Error creating asset:", error);
      const errorMessage = error.response?.data?.details
        ? JSON.stringify(error.response.data.details)
        : error.response?.data?.error || "Unable to add the asset.";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading || !masterData) {
    return <div className="p-4">Loading form options...</div>;
  }

  return (
    <AssetForm
      isEditing={false}
      formData={formData}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/assets")}
      masterData={masterData}
    />
  );
}

export default AddAssetPage;
