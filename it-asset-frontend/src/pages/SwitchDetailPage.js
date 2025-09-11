// src/pages/SwitchDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import SwitchPortManager from '../components/SwitchPortManager';

// --- Icon for the details card ---
const SwitchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> {/* CHANGED */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.25 10.25a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5zM7 14.25a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5h-5.5A.75.75 0 017 14.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 12a8.625 8.625 0 1117.25 0 8.625 8.625 0 01-17.25 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12 5.25a.75.75 0 100 1.5.75.75 0 000 1.5z" />
    </svg>
);


function SwitchDetailPage() {
  const { switchId } = useParams();
  const [sw, setSwitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSwitchDetails = async () => {
      try {
        const response = await api.get(`/switches/${switchId}`);
        setSwitch(response.data);
      } catch (err) {
        setError('Failed to load switch details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSwitchDetails();
  }, [switchId]);

  if (loading) return <div className="text-center p-8">Loading switch details...</div>;
  if (error) return <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      {/* --- REDESIGNED HEADER --- */}
      <div>
        <Link 
          to="/switches" 
          className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors" /* CHANGED */
        >
          &larr; Back to switch infrastructure
        </Link>
        <div className="card mt-2 flex items-center gap-6 p-4"> {/* CHANGED */}
            <div className="flex-shrink-0">
                <SwitchIcon />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{sw.name}</h1> {/* CHANGED */}
                <div className="flex items-center gap-x-6 gap-y-1 text-sm text-[var(--color-text-secondary)] flex-wrap"> {/* CHANGED */}
                  <span><strong>Model:</strong> {sw.model || 'N/A'}</span>
                  <span><strong>IP Address:</strong> {sw.ip_address || 'N/A'}</span>
                </div>
            </div>
        </div>
      </div>
      
      <SwitchPortManager switchId={switchId} />
    </div>
  );
}

export default SwitchDetailPage;