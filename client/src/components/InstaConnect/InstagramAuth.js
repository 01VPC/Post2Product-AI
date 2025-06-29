import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const InstagramAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleInstagramAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/insta-connect/instagram/initiate', {
        params: { email: user.email }
      });
      window.location.href = response.data.authorization_url;
    } catch (err) {
      setError('Failed to initiate Instagram authentication');
      console.error('Instagram auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connect Instagram</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          onClick={handleInstagramAuth}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Instagram Account'}
        </button>
      </div>
    </div>
  );
};

export default InstagramAuth; 