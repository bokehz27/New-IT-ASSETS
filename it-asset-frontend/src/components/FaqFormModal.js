// src/components/FaqFormModal.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import SearchableDropdown from "../components/SearchableDropdown";

// --- Helpers ---
const API_HOST = (
  process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api"
).replace(/\/api\/?$/, "");
function toAbsoluteFileURL(u) {
  if (!u || /^https?:\/\//i.test(u)) return u || "";
  return `${API_HOST}${u.startsWith("/") ? u : `/${u}`}`;
}
function getFileName(u) {
  if (!u) return "";
  return u.split("/").pop() || "";
}
// --- End Helpers ---

function FaqFormModal({ mode, faqId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    answer: "",
    videoUrl: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [links, setLinks] = useState({ pdf: "" });
  const [removePdf, setRemovePdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchFaqData = useCallback(async () => {
    if (mode === "update" && faqId) {
      setLoading(true);
      try {
        const res = await api.get(`/faqs/${faqId}`);
        const data = res.data;
        setFormData({
          question: data.question || "",
          category: data.category || "",
          answer: data.answer || "",
          videoUrl: data.video_url || "",
        });
        setLinks({ pdf: data.pdf_url || "" });
      } catch (err) {
        setMessage("Failed to load FAQ data.");
      } finally {
        setLoading(false);
      }
    }
  }, [mode, faqId]);

  useEffect(() => {
    fetchFaqData();
  }, [fetchFaqData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question) {
      setMessage("Question field is required.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    const fd = new FormData();
    fd.append("question", formData.question);
    fd.append("category", formData.category);
    fd.append("answer", formData.answer);
    fd.append("video_url", formData.videoUrl);
    if (pdfFile) fd.append("pdf", pdfFile);
    if (removePdf) fd.append("remove_pdf", "true");

    try {
      if (mode === "update") {
        await api.put(`/faqs/${faqId}`, fd);
      } else {
        await api.post("/faqs", fd);
      }
      onSuccess();
    } catch (err) {
      setMessage(err?.response?.data?.error || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition sm:text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex justify-center items-center z-[9990]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
          <h2 className="text-lg font-semibold">
            {mode === "update" ? `Edit FAQ #${faqId}` : "Create New FAQ"}
          </h2>
        </div>

        {/* --- ✨ [แก้ไข] รวมฟอร์มและปุ่มไว้ใน <form> เดียว และมีเงื่อนไข loading ครอบทั้งหมด --- */}
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>

              <SearchableDropdown
                idPrefix="category"
                placeholder="Select category"
                value={formData.category}
                onChange={(v) => setFormData({ ...formData, category: v })}
                options={[
                  {
                    value: "Internet",
                    label: "Internet",
                  },
                  {
                    value: "Share file",
                    label: "Share file",
                  },
                  {
                    value: "Conference",
                    label: "Conference",
                  },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Answer / Description
              </label>
              <textarea
                rows="5"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                className={inputClassName}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Video Guide (URL)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                className={inputClassName}
                placeholder="e.g., https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PDF Document
              </label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="faq-pdf-file"
                  className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Select PDF
                </label>
                <input
                  type="file"
                  id="faq-pdf-file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    setPdfFile(e.target.files?.[0]);
                    if (e.target.files?.[0]) setRemovePdf(false);
                  }}
                />
                <span className="text-sm text-slate-500">
                  {pdfFile?.name ||
                    getFileName(links.pdf) ||
                    "No file selected"}
                </span>
                {links.pdf && (
                  <a
                    href={toAbsoluteFileURL(links.pdf)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    View
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-4">
              {message && (
                <p className="text-red-600 font-semibold text-sm mr-auto">
                  {message}
                </p>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 font-semibold text-sm bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FaqFormModal;
