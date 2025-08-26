import React, { useState, useEffect } from "react";
import api from '../api';
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function TicketFormPage() {
  const [users, setUsers] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [formData, setFormData] = useState({
    reporter_name: "",
    asset_code: "",
    problem_description: "",
    contact_phone: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/public/asset-users");
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    const fetchAssets = async () => {
      try {
        const res = await api.get("/public/assets-list");
        const options = res.data.map((asset) => ({
          value: asset.asset_code,
          label: `${asset.asset_code} ${asset.model ? `- ${asset.model}` : ""}`,
        }));
        setAssetOptions(options);
      } catch (error) {
        console.error("Failed to fetch assets", error);
      }
    };

    fetchUsers();
    fetchAssets();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssetSelectChange = (selectedOption) => {
    setFormData({
      ...formData,
      asset_code: selectedOption ? selectedOption.value : "",
    });
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const submissionData = new FormData();
    submissionData.append("reporter_name", formData.reporter_name);
    submissionData.append("asset_code", formData.asset_code);
    submissionData.append("problem_description", formData.problem_description);
    submissionData.append("contact_phone", formData.contact_phone);
    if (attachment) {
      submissionData.append("attachment", attachment);
    }

    try {
      await api.post("/public/tickets", submissionData);
      alert("Issue reported successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to submit ticket", error);
      alert("An error occurred while reporting the issue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">
        Report an Issue
      </h2>
      <p className="text-gray-500 mb-8">
        Please fill in the information below to submit the issue for review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Reporter & Device Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Reporter Name
              </label>
              <Select
                classNamePrefix="react-select"
                options={users.map((user) => ({ value: user, label: user }))}
                onChange={(selectedOption) =>
                  handleInputChange({
                    target: {
                      name: "reporter_name",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                value={
                  formData.reporter_name
                    ? {
                        value: formData.reporter_name,
                        label: formData.reporter_name,
                      }
                    : null
                }
                placeholder="-- Search or select your name --"
                isClearable
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Asset Code
              </label>
              <Select
                classNamePrefix="react-select"
                options={assetOptions}
                onChange={handleAssetSelectChange}
                value={assetOptions.find(
                  (option) => option.value === formData.asset_code
                )}
                placeholder="-- Search or select asset code --"
                isClearable
                required
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Issue Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="Internal extension (4 digits)"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Attach File (if any)
              </label>
              <div className="flex items-center gap-4">
                <label htmlFor="attachment-input" className="file-input-label">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>Select File</span>
                </label>
                <span className="text-sm text-gray-500">
                  {attachment ? attachment.name : "No file selected"}
                </span>
              </div>
              <input
                id="attachment-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-semibold text-gray-600">
                Describe the Issue
              </label>
              <textarea
                name="problem_description"
                value={formData.problem_description}
                onChange={handleInputChange}
                rows="5"
                className="w-full"
                placeholder="Please describe the issue in detail..."
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 shadow-md hover:shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit Repair Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TicketFormPage;
