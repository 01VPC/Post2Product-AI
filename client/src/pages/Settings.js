import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    instagram: {
      accessToken: ''
    },
    amazon: {
      sellerId: '',
      accessKey: '',
      secretKey: ''
    }
  });

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/auth/profile', {
        name: formData.name,
        email: formData.email
      });
      updateUser(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleInstagramConnect = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/instagram/connect', {
        access_token: formData.instagram.accessToken
      });
      // Update user state to reflect Instagram connection
      updateUser({ ...user, instagram_connected: true });
    } catch (error) {
      console.error('Error connecting Instagram:', error);
    }
  };

  const handleDisconnectInstagram = async () => {
    try {
      await axios.post('/api/insta-connect/instagram/disconnect', { email: user.email });
      updateUser({ ...user, instagram_connected: false, instagram_username: null });
    } catch (error) {
      alert('Failed to disconnect Instagram');
    }
  };

  const handleAmazonConnect = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/amazon/connect', {
        seller_id: formData.amazon.sellerId,
        access_key: formData.amazon.accessKey,
        secret_key: formData.amazon.secretKey
      });
      // Update user state to reflect Amazon connection
      updateUser({ ...user, amazon_connected: true });
    } catch (error) {
      console.error('Error connecting Amazon:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

      {/* Theme Toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <span className="font-medium text-gray-800 dark:text-gray-100">Theme:</span>
        <div
          onClick={toggleTheme}
          className="relative flex items-center cursor-pointer select-none w-28 h-10 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
        >
          <span className={`absolute left-3 z-10 text-sm font-medium transition-colors ${theme === 'light' ? 'text-blue-700' : 'text-gray-500 dark:text-gray-300'}`}>Light</span>
          <span className={`absolute right-3 z-10 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-blue-300' : 'text-gray-500 dark:text-gray-300'}`}>Dark</span>
          <div
            className={`absolute top-1 left-1 w-8 h-8 rounded-full shadow-md transition-all duration-300 ${theme === 'dark' ? 'translate-x-16 bg-blue-600' : 'translate-x-0 bg-white'}`}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#23272f] rounded-lg shadow">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
            <Tab className={({ selected }) =>
              `px-6 py-3 text-sm font-medium outline-none ${
                selected
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              }`
            }>
              Account
            </Tab>
            <Tab className={({ selected }) =>
              `px-6 py-3 text-sm font-medium outline-none ${
                selected
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              }`
            }>
              API Connections
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="space-y-8">
                {/* Profile Information */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </form>

                {/* Password Update */}
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-8">
                {/* Instagram Connection */}
                <form onSubmit={handleInstagramConnect} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Instagram Connection</h3>
                    {user?.instagram_connected && (
                      <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Access Token</label>
                    <input
                      type="text"
                      name="accessToken"
                      value={formData.instagram.accessToken}
                      onChange={(e) => handleInputChange(e, 'instagram')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={user?.instagram_connected}
                  >
                    {user?.instagram_connected ? 'Connected' : 'Connect Instagram'}
                  </button>
                  {user?.instagram_connected && (
                    <button
                      type="button"
                      onClick={handleDisconnectInstagram}
                      className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Disconnect Instagram
                    </button>
                  )}
                </form>

                {/* Amazon Connection */}
                <form onSubmit={handleAmazonConnect} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Amazon Connection</h3>
                    {user?.amazon_connected && (
                      <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Seller ID</label>
                    <input
                      type="text"
                      name="sellerId"
                      value={formData.amazon.sellerId}
                      onChange={(e) => handleInputChange(e, 'amazon')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Access Key</label>
                    <input
                      type="text"
                      name="accessKey"
                      value={formData.amazon.accessKey}
                      onChange={(e) => handleInputChange(e, 'amazon')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Secret Key</label>
                    <input
                      type="password"
                      name="secretKey"
                      value={formData.amazon.secretKey}
                      onChange={(e) => handleInputChange(e, 'amazon')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={user?.amazon_connected}
                  >
                    {user?.amazon_connected ? 'Connected' : 'Connect Amazon'}
                  </button>
                </form>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

export default Settings; 