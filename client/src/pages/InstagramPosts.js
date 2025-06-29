import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function InstagramPosts() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.instagram_connected) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/insta-connect/media/media', {
        params: { email: user.email },
      });
      // Map backend response to post format
      const media = response.data.media || [];
      setPosts(media.map(item => ({
        id: item.id || item.media_id,
        media_url: item.media_url instanceof Array ? item.media_url[0] : item.media_url,
        caption: item.caption,
        media_type: item.media_type,
        likes: item.likes || 0,
        comments: item.comments || 0,
        timestamp: item.timestamp || item.created_at,
        converted: item.product ? true : false,
      })));
      setLastSync(new Date().toLocaleString());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (post) => {
    try {
      // Placeholder: call your backend to create a product from this post
      // await axios.post('/api/amazon/create-listing', { instagram_post_id: post.id });
      // For now, just mark as converted in UI
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, converted: true } : p));
    } catch (err) {
      alert('Error creating product');
    }
  };

  // Sidebar and layout handled by Layout.js
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
      <div className="px-8 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Instagram Integration</h1>
          <div className="flex items-center ml-8">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-gray-700 dark:text-white font-semibold">{user?.name || 'User'}</span>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="mb-8">
          <div className="bg-white dark:bg-[#2D2D2D] rounded-lg shadow flex items-center justify-between px-8 py-6 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">Instagram Account</div>
              {user?.instagram_connected ? (
                <>
                  <div className="text-gray-600 dark:text-gray-300 mb-1">Connected to: <span className="font-semibold">@{user.instagram_username || 'your_account'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Last Sync: {lastSync || 'Never'}</div>
                </>
              ) : (
                <div className="text-red-500">Not Connected</div>
              )}
            </div>
            <div>
              {user?.instagram_connected ? (
                <button className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold" disabled>
                  Connected
                </button>
              ) : (
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold"
                  onClick={() => navigate('/instagram/connect')}
                >
                  Connect Instagram
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">Recent Posts</div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-lg border-gray-300 dark:bg-[#2D2D2D] dark:text-gray-200">
              <option>Filter by Performance</option>
              <option>Most Liked</option>
              <option>Most Comments</option>
              <option>Most Recent</option>
            </select>
            <button
              onClick={fetchPosts}
              className="p-2 text-blue-500 hover:text-blue-600"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-[#333333] rounded-lg shadow overflow-hidden">
                  {/* Post Image */}
                  <div className="aspect-w-1 aspect-h-1">
                    {post.media_type === 'IMAGE' ? (
                      <img
                        src={post.media_url}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : post.media_type === 'VIDEO' ? (
                      <video controls src={post.media_url} className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  {/* Post Details */}
                  <div className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 mb-4 line-clamp-2">
                      {post.caption}
                    </p>

                    {/* Engagement Stats */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {post.likes?.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">likes</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {post.comments?.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">comments</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {post.converted ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Product Created
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateProduct(post)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Convert to Product
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 space-x-2">
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-full ${
                    page === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-[#2D2D2D] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InstagramPosts; 