// frontend/src/pages/BackupManagerPage.jsx
import React, { useEffect, useState } from "react";

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDate(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString();
}

const BackupManagerPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);

  const apiBase = process.env.REACT_APP_API_URL || "/api";

  // ดึง token จาก localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/backups`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (res.status === 401) {
        alert("ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        setBackups([]);
        return;
      }

      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setBackups(data);
    } catch (err) {
      console.error("[BACKUP] Load error:", err);
      alert("โหลดรายการ backup ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleRunBackup = async () => {
    if (!window.confirm("Do you want to create a backup now?")) return;
    setRunningBackup(true);
    try {
      const res = await fetch(`${apiBase}/backups/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (res.status === 401) {
        alert("ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        return;
      }

      if (!res.ok) throw new Error("Backup failed");
      await loadBackups();
      alert("Backup successful");
    } catch (err) {
      console.error("[BACKUP] Run error:", err);
      alert("Backup failed");
    } finally {
      setRunningBackup(false);
    }
  };

  // ✅ แก้ให้ Download ผ่าน fetch + token (รองรับกรณีมี authMiddleware)
  const handleDownload = async (filename) => {
    try {
      const res = await fetch(
        `${apiBase}/backups/${encodeURIComponent(filename)}/download`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "[BACKUP] Download error:",
          res.status,
          res.statusText,
          text
        );
        alert(
          `Download failed (${res.status})` +
            (text ? `: ${text}` : "")
        );
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[BACKUP] Download exception:", err);
      alert("Download failed (exception)");
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`ต้องการลบไฟล์ ${filename} จริงหรือไม่?`)) return;
    try {
      const res = await fetch(
        `${apiBase}/backups/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (res.status === 401) {
        alert("Unauthorized. Please log in again.");
        return;
      }

      if (!res.ok) {
        let message = "Delete failed";
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch (_) {
          // ignore parse error
        }
        console.error("[BACKUP] Delete error:", res.status, message);
        alert(message);
        return;
      }

      await loadBackups();
    } catch (err) {
      console.error("[BACKUP] Delete exception:", err);
      alert("Delete failed (exception)");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header + Actions (สไตล์ให้ใกล้กับหน้า Vendor) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
            Database Backup
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage database backup files: create new, download and delete.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadBackups}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={handleRunBackup}
            disabled={runningBackup}
            className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-60"
          >
            {runningBackup ? "กำลัง Backup..." : "Run Backup Now"}
          </button>
        </div>
      </div>

      {/* Table section (layout / style ให้เหมือน Vendor) */}
      {loading ? (
        <div className="text-center p-16 text-slate-500">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
              <tr>
                <th className="p-3 font-semibold w-1/2">Filename</th>
                <th className="p-3 font-semibold w-1/6">Size</th>
                <th className="p-3 font-semibold w-1/4">Created At</th>
                <th className="p-3 font-semibold w-[140px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No backup files.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-slate-50">
                    <td className="p-3 align-middle font-medium text-slate-900">
                      {b.filename}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      {formatSize(b.size)}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleDownload(b.filename)}
                          className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(b.filename)}
                          className="px-3 py-1 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BackupManagerPage;
