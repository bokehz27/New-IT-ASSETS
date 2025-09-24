// pages/FaqManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import Modal from "react-modal";
import FaqFormModal from "../components/FaqFormModal";
import { FaPlus, FaEdit, FaTrashAlt, FaVideo, FaFilePdf } from "react-icons/fa";

Modal.setAppElement("#root");

// ⭐ Helper Functions (เหมือนใน PublicFaqPage)
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

  // State สำหรับ Form Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // State สำหรับ Video Modal
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

  // --- Functions for Form Modal ---
  const openFormModal = (mode, faqId = null) => {
    setModalMode(mode);
    setSelectedFaqId(faqId);
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedFaqId(null);
  };
  const handleFormSuccess = () => {
    closeFormModal();
    fetchFaqs();
  };

  // --- Functions for Video Modal ---
  const openVideoModal = (videoUrl) => {
    const embedUrl = convertYoutubeUrlToEmbed(videoUrl);
    if (embedUrl) {
      setCurrentVideoUrl(embedUrl);
      setIsVideoModalOpen(true);
    }
  };
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl("");
  };

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
    <div className="my-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Manage FAQs</h2>
        <button
          onClick={() => openFormModal("create")}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          <span>Create FAQ</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-16">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full text-sm text-left">
            {/* ⭐ (สำคัญ) เพิ่ม Thead ที่หายไปกลับเข้ามา */}
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold w-2/5">Question</th>
                <th className="p-3 font-semibold text-center">Video</th>
                <th className="p-3 font-semibold text-center">PDF</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="p-3 align-middle text-gray-800">
                    {faq.category || "-"}
                  </td>
                  <td className="p-3 align-middle font-medium text-gray-900">
                    {faq.question}
                  </td>
                  <td className="p-3 align-middle text-center">
                    {faq.video_url ? (
                      <button
                        onClick={() => openVideoModal(faq.video_url)}
                        title="Watch Video"
                      >
                        <FaVideo className="text-green-500 mx-auto text-lg cursor-pointer hover:text-green-700" />
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 align-middle text-center">
                    {faq.pdf_url ? (
                      <a
                        href={toAbsoluteFileURL(faq.pdf_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View PDF"
                      >
                        <FaFilePdf className="text-red-500 mx-auto text-lg cursor-pointer hover:text-red-700" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 align-middle whitespace-nowrap">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openFormModal("update", faq.id)}
                        className="bg-blue-500 hover:bg-blue-600 table-action-button"
                        title="Update"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="bg-red-500 hover:bg-red-600 text-white table-action-button"
                        title="Delete"
                      >
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

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onRequestClose={closeFormModal}
        contentLabel="FAQ Form Modal"
        className="ReactModal__Content form-modal-content"
        overlayClassName="ReactModal__Overlay"
      >
        <button onClick={closeFormModal} className="modal-close-button">
          &times;
        </button>
        <FaqFormModal
          mode={modalMode}
          faqId={selectedFaqId}
          onSuccess={handleFormSuccess}
          onCancel={closeFormModal}
        />
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onRequestClose={closeVideoModal}
        contentLabel="Video Preview Modal"
        className="video-modal"
        overlayClassName="ReactModal__Overlay"
      >
        <div className="video-modal-wrapper">
          <button
            onClick={closeVideoModal}
            className="video-modal-close-button"
          >
            &times;
          </button>
          {currentVideoUrl && (
            <iframe
              src={currentVideoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-modal-iframe"
            ></iframe>
          )}
        </div>
      </Modal>
    </div>
  );
}
export default FaqManagementPage;
