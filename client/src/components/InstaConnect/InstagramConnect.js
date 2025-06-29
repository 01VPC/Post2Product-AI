import React from 'react';
import axios from 'axios';

function InstagramConnect({ userEmail }) {
  const handleConnect = async () => {
    try {
      const res = await axios.get(`/api/insta-connect/instagram/initiate?email=${userEmail}`);
      window.location.href = res.data.authorization_url; // Redirect to Instagram OAuth
    } catch (err) {
      alert('Failed to initiate Instagram connection');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-10 py-12 w-full max-w-md flex flex-col items-center">
        {/* Instagram Icon */}
        <div className="mb-6">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="16" fill="url(#ig-gradient)"/>
            <defs>
              <linearGradient id="ig-gradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f58529"/>
                <stop offset="0.5" stopColor="#dd2a7b"/>
                <stop offset="1" stopColor="#515bd4"/>
              </linearGradient>
            </defs>
            <g>
              <circle cx="28" cy="28" r="13" stroke="white" strokeWidth="3"/>
              <circle cx="41" cy="15" r="2.5" fill="white"/>
            </g>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Connect Instagram</h2>
        <p className="text-gray-500 mb-8 text-center">Connect your Instagram account to import your posts and start converting them into product listings.</p>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 shadow-md hover:scale-105 hover:shadow-lg transition transform duration-150"
          onClick={handleConnect}
        >
          {/* Instagram icon for button */}
          <svg width="22" height="22" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="16" fill="url(#ig-gradient-btn)"/>
            <defs>
              <linearGradient id="ig-gradient-btn" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f58529"/>
                <stop offset="0.5" stopColor="#dd2a7b"/>
                <stop offset="1" stopColor="#515bd4"/>
              </linearGradient>
            </defs>
            <g>
              <circle cx="28" cy="28" r="13" stroke="white" strokeWidth="3"/>
              <circle cx="41" cy="15" r="2.5" fill="white"/>
            </g>
          </svg>
          Connect Instagram Account
        </button>
      </div>
    </div>
  );
}

export default InstagramConnect;