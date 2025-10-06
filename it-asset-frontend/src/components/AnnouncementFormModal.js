// components/AnnouncementFormModal.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

function AnnouncementFormModal({ mode, announcementId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'Announcement',
    link_url: '',
    link_text: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncementDetails = useCallback(async () => {
    if (mode === 'update' && announcementId) {
      setIsLoading(true);
      try {
        const res = await api.get(`/announcements/${announcementId}`);
        setFormData({
          title: res.data.title || '',
          content: res.data.content || '',
          type: res.data.type || 'Announcement',
          link_url: res.data.link_url || '',
          link_text: res.data.link_text || '',
        });
      } catch (err) {
        setError('Failed to load announcement data.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [mode, announcementId]);

  useEffect(() => {
    fetchAnnouncementDetails();
  }, [fetchAnnouncementDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'update') {
        await api.put(`/announcements/${announcementId}`, formData);
      } else {
        await api.post('/announcements', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">
              {mode === 'update' ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm" />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">Content (Optional)</label>
              <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows="3" className="w-full border-slate-300 rounded-md shadow-sm"></textarea>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm">
                <option value="Announcement">Announcement</option>
                <option value="Exam Link">Exam Link</option>
                <option value="News">News</option>
              </select>
            </div>

            <div>
              <label htmlFor="link_url" className="block text-sm font-medium text-slate-700 mb-1">Link URL (Optional)</label>
              <input type="url" name="link_url" id="link_url" value={formData.link_url} onChange={handleChange} placeholder="https://..." className="w-full border-slate-300 rounded-md shadow-sm" />
            </div>

            <div>
              <label htmlFor="link_text" className="block text-sm font-medium text-slate-700 mb-1">Link Button Text (Optional)</label>
              <input type="text" name="link_text" id="link_text" value={formData.link_text} onChange={handleChange} placeholder="e.g., Click for Exam" className="w-full border-slate-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 flex justify-end items-center gap-3 rounded-b-xl">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementFormModal;