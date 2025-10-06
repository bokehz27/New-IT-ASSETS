// pages/FaqManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
// ✨ 1. ลบ import Modal จาก react-modal ออก
import FaqFormModal from "../components/FaqFormModal";
import { FaPlus, FaEdit, FaTrashAlt, FaVideo, FaFilePdf } from "react-icons/fa";

// Helper Functions (คงเดิม)
const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
const toAbsoluteFileURL = (url) => {
  if (!url) return "";
  const API_HOST = API_URL.replace(/\/api\/?$/, "");
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_HOST}${url}`;
};
const convertYoutubeUrlToEmbed = (url) => {
  if (!url) return null;
  let videoId = null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
};

function FaqManagementPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/faqs");
      setFaqs(res.data);
    } catch (err) {
      console.error("Failed to fetch FAQs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openFormModal = (mode, faqId = null) => {
    setModalMode(mode);
    setSelectedFaqId(faqId);
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    // เพิ่มการเคลียร์ค่า ID เพื่อความปลอดภัย
    setSelectedFaqId(null);
  };
  const handleFormSuccess = () => {
    closeFormModal();
    fetchFaqs();
  };

  const openVideoModal = (videoUrl) => {
    const embedUrl = convertYoutubeUrlToEmbed(videoUrl);
    if (embedUrl) {
      setCurrentVideoUrl(embedUrl);
      setIsVideoModalOpen(true);
    }
  };
  const closeVideoModal = () => setIsVideoModalOpen(false);

  const handleDelete = async (faqId) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await api.delete(`/faqs/${faqId}`);
        fetchFaqs();
      } catch (err) {
        alert("Failed to delete FAQ.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
          Manage FAQs
        </h2>
        <button
          onClick={() => openFormModal("create")}
          className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:opacity-90 flex items-center gap-2"
        >
          <FaPlus />
          <span>Create FAQ</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-16 text-slate-500">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#0d47a1] to-[#2196f3] text-white">
              <tr>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold w-2/5">Question</th>
                <th className="p-3 font-semibold text-center">Video</th>
                <th className="p-3 font-semibold text-center">PDF</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50">
                  <td className="p-3 align-middle text-slate-700">{faq.category || "-"}</td>
                  <td className="p-3 align-middle font-medium text-slate-900">{faq.question}</td>
                  <td className="p-3 align-middle text-center">
                    {faq.video_url ? (
                      <button onClick={() => openVideoModal(faq.video_url)} title="Watch Video">
                        <FaVideo className="text-green-500 mx-auto text-lg cursor-pointer hover:text-green-700" />
                      </button>
                    ) : (<span className="text-slate-400">-</span>)}
                  </td>
                  <td className="p-3 align-middle text-center">
                    {faq.pdf_url ? (
                      <a href={toAbsoluteFileURL(faq.pdf_url)} target="_blank" rel="noopener noreferrer" title="View PDF">
                        <FaFilePdf className="text-red-500 mx-auto text-lg cursor-pointer hover:text-red-700" />
                      </a>
                    ) : (<span className="text-slate-400">-</span>)}
                  </td>
                  <td className="p-3 align-middle whitespace-nowrap">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => openFormModal("update", faq.id)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Update">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-2 rounded-full text-red-600 hover:bg-red-100" title="Delete">
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ✨ 2. [แก้ไข] เปลี่ยนมาเรียก FaqFormModal โดยตรง --- */}
      {isFormModalOpen && (
        <FaqFormModal
          mode={modalMode}
          faqId={selectedFaqId}
          onSuccess={handleFormSuccess}
          onCancel={closeFormModal}
        />
      )}

      {/* --- Video Modal (ใช้ดีไซน์ใหม่ที่ดูสะอาดตาขึ้น) --- */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
             <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg">
                <button 
                  onClick={closeVideoModal} 
                  className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1 text-2xl leading-none shadow-lg hover:bg-slate-200"
                >
                  &times;
                </button>
                <iframe 
                  src={currentVideoUrl} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full h-full rounded-lg"
                >
                </iframe>
             </div>
        </div>
      )}
    </div>
  );
}
export default FaqManagementPage;