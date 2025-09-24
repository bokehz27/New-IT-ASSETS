// src/components/FaqFormModal.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api"; // หรือ axios instance ที่คุณใช้

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

function ClearBtn({ onClick, title = "Remove" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-500 hover:bg-red-50"
    >
      ✕
    </button>
  );
}
// --- End Helpers ---

function FaqFormModal({ mode, faqId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    answer: "",
    videoUrl: "", // 1. เพิ่ม State สำหรับเก็บ Video URL
  });
  // const [videoFile, setVideoFile] = useState(null); // 2. ลบ State เดิมของ video file
  const [pdfFile, setPdfFile] = useState(null);
  const [links, setLinks] = useState({ video: "", pdf: "" });
  // const [removeVideo, setRemoveVideo] = useState(false); // 2. ลบ State เดิมของ video file
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
          videoUrl: data.video_url || "", // 3. ดึงค่า video_url มาใส่ใน State
        });
        setLinks({
          video: data.video_url || "",
          pdf: data.pdf_url || "",
        });
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
    fd.append("video_url", formData.videoUrl); // 4. เปลี่ยนเป็นส่ง video_url แทนไฟล์
    if (pdfFile) fd.append("pdf", pdfFile);
    // if (removeVideo) fd.append("remove_video", "true"); // 4. ลบส่วนนี้ออก
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {mode === "update" ? `Edit FAQ #${faqId}` : "Create New FAQ"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded border p-2"
            placeholder="e.g., Hardware, Software"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Answer / Description</label>
          <textarea
            rows="5"
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            className="w-full rounded border p-2"
          ></textarea>
        </div>

        {/* --- 5. เปลี่ยน UI จาก Upload เป็น Text Input --- */}
        <div>
          <label className="block mb-1 font-medium">Video Guide (URL)</label>
          <input
            type="text"
            value={formData.videoUrl}
            onChange={(e) =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
            className="w-full rounded border p-2"
            placeholder="e.g., https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* --- PDF Upload (ยังคงเดิม) --- */}
        <div>
          <label className="block mb-1 font-medium">PDF Document</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="faq-pdf-file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPdfFile(f);
                if (f) setRemovePdf(false);
              }}
            />
            <label
              htmlFor="faq-pdf-file"
              className="cursor-pointer rounded border px-3 py-2 hover:bg-gray-50"
            >
              Select PDF
            </label>
            <span className="text-sm text-gray-500">
              {pdfFile?.name || getFileName(links.pdf) || "No file selected"}
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
            {(pdfFile || links.pdf) && (
              <ClearBtn
                title="Remove PDF"
                onClick={() => {
                  setPdfFile(null);
                  setLinks((p) => ({ ...p, pdf: "" }));
                  setRemovePdf(true);
                }}
              />
            )}
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {message && <p className="text-red-600 font-semibold">{message}</p>}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FaqFormModal;
