// pages/PublicFaqPage.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaChevronDown, FaYoutube, FaFilePdf, FaBookOpen } from "react-icons/fa";

Modal.setAppElement("#root");

// Helper Functions
const API_URL = process.env.REACT_APP_API_URL || "http://172.18.1.61:5000/api";
const publicApi = axios.create({ baseURL: API_URL });
const toAbsoluteFileURL = (url) => {
  if (!url) return "";
  const API_HOST = API_URL.replace(/\/api\/?$/, "");
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_HOST}${url}`;
};
const convertYoutubeUrlToEmbed = (url) => {
    // (Function remains the same)
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
  const [activeCategory, setActiveCategory] = useState("All");
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
      } finally {
        setLoading(false);
      }
    };
    fetchPublicFaqs();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allFaqs.map((faq) => faq.category || "General"))];
    return ["All", ...uniqueCategories.sort()];
  }, [allFaqs]);

  const filteredFaqs = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allFaqs.filter((faq) => {
      const inCategory = activeCategory === "All" || (faq.category || "General") === activeCategory;
      const inSearch = !searchTerm || faq.question.toLowerCase().includes(lowerCaseSearchTerm) || faq.answer.toLowerCase().includes(lowerCaseSearchTerm);
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

  const closeVideoModal = () => setIsModalOpen(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] bg-clip-text text-transparent">
          FAQ & Help Center
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Find the answers to your most common questions below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1 sticky top-24">
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Categories</h2>
            <nav className="flex flex-col gap-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeCategory === category
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <FaBookOpen />
                  <span>{category}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={`Search in "${activeCategory}"...`}
              className="w-full pl-4 pr-10 py-3 text-base border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p className="text-slate-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && filteredFaqs.length === 0 && (
            <div className="text-center text-slate-500 py-16 bg-white border border-slate-200 rounded-xl">
                <p>No FAQs found matching your criteria.</p>
            </div>
          )}

          {!loading && filteredFaqs.length > 0 && (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <details key={faq.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50">
                    <span className="font-semibold text-slate-800">{faq.question}</span>
                    <FaChevronDown className="text-slate-500 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="p-4 border-t border-slate-200 text-slate-600 space-y-4">
                    <p>{faq.answer}</p>
                    
                    {/* ✨ [ปรับ Style] เปลี่ยนลิงก์ให้เป็นปุ่ม */}
                    <div className="flex items-center gap-4 pt-2">
                      {faq.video_url && (
                        <button 
                          onClick={() => openVideoModal(faq.video_url)} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-blue-600 shadow-sm transition-all hover:opacity-90"
                        >
                          <FaYoutube /> Watch Video
                        </button>
                      )}
                      {faq.pdf_url && (
                        <a 
                          href={toAbsoluteFileURL(faq.pdf_url)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-slate-600 shadow-sm transition-all hover:opacity-90"
                        >
                          <FaFilePdf /> View PDF
                        </a>
                      )}
                    </div>

                  </div>
                </details>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={closeVideoModal} contentLabel="Video Guide Modal" className="video-modal" overlayClassName="ReactModal__Overlay">
          <div className="video-modal-wrapper">
              <button onClick={closeVideoModal} className="video-modal-close-button">&times;</button>
              {currentVideoEmbedUrl && (<iframe src={currentVideoEmbedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="video-modal-iframe"></iframe>)}
          </div>
      </Modal>
    </div>
  );
}

export default PublicFaqPage;