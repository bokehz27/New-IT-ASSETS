// src/components/AdminUserModal.js (แก้ไขแล้ว)

import React, { useState, useEffect } from "react";
import api from "../api";
import { toast } from "react-toastify";

function AdminUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState(""); // ✨ 1. เพิ่ม State สำหรับ Confirm Password
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, password: "" });
    } else {
      setFormData({ username: "", password: "" });
    }
    setConfirmPassword("");
    setError("");
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // --- ✨ 2. เพิ่ม Logic การตรวจสอบ Password ---
    if (!user && !formData.password) {
        setError("Password is required for new users.");
        return;
    }
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // ตัด property ที่ไม่ต้องการส่งออกไป (role) และ password ถ้าไม่ได้กรอก
      const payload = { username: formData.username };
      if (formData.password) {
        payload.password = formData.password;
      }
      
      if (user) {
        await api.put(`/users/${user.id}`, payload);
        toast.success("User updated successfully!");
      } else {
        await api.post("/users", payload);
        toast.success("User created successfully!");
      }
      onSave();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const inputClassName = "w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
          <h2 className="text-lg font-semibold">{user ? "Edit User" : "Create New User"}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClassName} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClassName} placeholder={user ? "Leave blank to keep unchanged" : ""} />
              </div>
              {/* --- ✨ 3. เพิ่มช่อง Confirm Password --- */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClassName} />
              </div>

              {/* --- ✨ 4. ลบช่อง Role ออก --- */}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-70">
                    {submitting ? "Saving..." : "Save User"}
                </button>
            </div>
        </form>

      </div>
    </div>
  );
}

export default AdminUserModal;