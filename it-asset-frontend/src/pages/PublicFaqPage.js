// pages/PublicFaqPage.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaSearch, FaChevronDown, FaYoutube, FaFilePdf, FaBookOpen } from "react-icons/fa";

Modal.setAppElement("#root");

const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
const publicApi = axios.create({ baseURL: API_URL });

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

function PublicFaqPage() {
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All"); // State สำหรับ Category ที่เลือก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoEmbedUrl, setCurrentVideoEmbedUrl] = useState("");

  useEffect(() => {
    const fetchPublicFaqs = async () => {
      try {
        setLoading(true);
        const res = await publicApi.get("/public/faqs");
        setAllFaqs(res.data);
      } catch (err) {
        setError("Could not load FAQs.");
        console.error("Error fetching public FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicFaqs();
  }, []);

  // สร้างรายการ Category ที่ไม่ซ้ำกัน + 'All'
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allFaqs.map(faq => faq.category || "General"))];
    return ["All", ...uniqueCategories.sort()];
  }, [allFaqs]);

  // กรอง FAQ ตาม Category ที่เลือกและคำค้นหา
  const filteredFaqs = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allFaqs.filter(faq => {
      const inCategory = activeCategory === "All" || (faq.category || "General") === activeCategory;
      const inSearch = !searchTerm ||
        faq.question.toLowerCase().includes(lowerCaseSearchTerm) ||
        faq.answer.toLowerCase().includes(lowerCaseSearchTerm);
      return inCategory && inSearch;
    });
  }, [allFaqs, searchTerm, activeCategory]);

  const openVideoModal = (videoUrl) => {
    const embedUrl = convertYoutubeUrlToEmbed(videoUrl);
    if (embedUrl) {
      setCurrentVideoEmbedUrl(embedUrl);
      setIsModalOpen(true);
    }
  };

  const closeVideoModal = () => {
    setIsModalOpen(false);
    setCurrentVideoEmbedUrl("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">FAQ & Help Center</h1>
        <p className="mt-4 text-lg text-gray-600">Find the answers to your most common questions below.</p>
      </div>

      <div className="faq-v2-container">
        {/* Sidebar */}
        <aside className="faq-v2-sidebar">
          <div className="faq-v2-sidebar-inner">
            <h2 className="faq-v2-sidebar-title">Categories</h2>
            <nav className="flex flex-col gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`faq-v2-category-link ${activeCategory === category ? 'active' : ''}`}
                >
                  <FaBookOpen />
                  <span>{category}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="faq-v2-content">
          <div className="faq-v2-search-wrapper">
            <input
              type="text"
              placeholder={`Search in "${activeCategory}"...`}
              className="faq-v2-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && filteredFaqs.length === 0 && (
             <p className="text-center text-gray-500 mt-8">No FAQs found.</p>
          )}

          {!loading && filteredFaqs.length > 0 && (
            <div className="space-y-4">
              {filteredFaqs.map(faq => {
                const embedUrl = convertYoutubeUrlToEmbed(faq.video_url);
                return (
                  <details key={faq.id} className="faq-v2-item">
                    <summary className="faq-v2-summary">
                      {faq.question}
                      <FaChevronDown className="faq-v2-summary-icon" />
                    </summary>
                    <div className="faq-v2-answer">
                      <p>{faq.answer}</p>
                      <div className="faq-v2-media-section">
                        {embedUrl && (
                          <button onClick={() => openVideoModal(faq.video_url)} className="faq-v2-media-btn video">
                            <FaYoutube /> Watch Video
                          </button>
                        )}
                        {faq.pdf_url && (
                          <a href={toAbsoluteFileURL(faq.pdf_url)} target="_blank" rel="noopener noreferrer" className="faq-v2-media-btn pdf">
                            <FaFilePdf /> View PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Video Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeVideoModal}
        contentLabel="Video Guide Modal"
        className="video-modal" // ⭐ 1. ใช้ class ใหม่สำหรับ Modal
        overlayClassName="ReactModal__Overlay"
      >
        <div className="video-modal-wrapper"> {/* ⭐ 2. เพิ่ม wrapper สำหรับ aspect ratio */}
          <button onClick={closeVideoModal} className="video-modal-close-button">&times;</button>
          {currentVideoEmbedUrl && (
            <iframe
              src={currentVideoEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-modal-iframe" // ⭐ 3. ใช้ class ใหม่สำหรับ iframe
            ></iframe>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default PublicFaqPage;