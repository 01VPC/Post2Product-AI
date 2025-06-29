import React, { useEffect, useState } from 'react';
import InstagramConnect from './InstagramConnect';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function MediaGallery() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && user.instagram_connected) {
      fetchMedia();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchMedia = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`/api/insta-connect/media/media`, {
        params: { email: user.email },
      });
      setMedia(res.data.media || []);
    } catch (err) {
      setError('Failed to fetch Instagram media.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (mediaItem) => {
    // Placeholder for conversion logic
    setSuccess('');
    setError('');
    try {
      // You can call your backend endpoint here to convert the post
      // Example: await axios.post('/api/convert', { mediaId: mediaItem.id });
      setSuccess('Post conversion started for media: ' + mediaItem.id);
    } catch (err) {
      setError('Failed to convert post.');
    }
  };

  if (!user || !user.instagram_connected) {
    return (
      <div className="flex flex-col items-center mt-10">
        <div className="text-red-500 mb-4">Instagram account not connected</div>
        <InstagramConnect userEmail={user?.email || ''} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-10 bg-gray-50 dark:bg-[#1E1E1E] min-h-screen w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Instagram Posts</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {media.length === 0 && !loading && (
          <div className="col-span-full text-gray-500 dark:text-gray-300">No media found.</div>
        )}
        {media.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#333333] rounded shadow p-4 flex flex-col items-center">
            {item.media_type === 'IMAGE' && (
              <img src={item.media_url} alt={item.caption || 'Instagram post'} className="w-full h-64 object-cover rounded mb-2" />
            )}
            {item.media_type === 'VIDEO' && (
              <video controls src={item.media_url} className="w-full h-64 object-cover rounded mb-2" />
            )}
            <div className="font-semibold mb-1 text-gray-900 dark:text-gray-200">{item.caption || <span className="text-gray-400">No caption</span>}</div>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleConvert(item)}
            >
              Convert to Posting
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaGallery;