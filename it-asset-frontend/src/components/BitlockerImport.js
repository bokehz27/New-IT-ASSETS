import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";

function BitlockerImport({ assetId, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      setMessage("Uploading...");
      setError("");
      const token = localStorage.getItem("token"); // Get auth token
      const response = await axios.post(
        `${API_URL}/assets/${assetId}/upload-bitlocker`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-auth-token": token,
          },
        }
      );
      setMessage(response.data.message);
      if (onImportSuccess) {
        onImportSuccess(); // Callback to refresh asset data on the page
      }
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
      setMessage("");
    }
  };

  return (
    <div className="p-4 border-t mt-4">
      <h4 className="text-md font-semibold mb-2">
        Import BitLocker Keys from .txt
      </h4>
      <div className="flex items-center space-x-2">
        <input type="file" accept=".txt" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-600 transition"
        >
          Import
        </button>
      </div>
      {message && <p className="text-green-600 mt-2">{message}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default BitlockerImport;
