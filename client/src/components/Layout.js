import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  PhotoIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import ChatbotButton from './ChatbotButton';
import ChatbotWindow from './ChatbotWindow';

function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Instagram', href: '/instagram', icon: PhotoIcon },
    { name: 'Products', href: '/product/create', icon: ShoppingCartIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-blue-800 dark:bg-[#1A237E]">
        {/* Logo */}
        <div className="flex items-center h-16 px-6">
          <h1 className="text-xl font-bold text-white">
            Post2Product<span className="text-blue-300">AI</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 dark:bg-[#3F51B5] text-white'
                    : 'text-blue-100 hover:bg-blue-700 dark:hover:bg-[#283593]'
                }`}
              >
                <Icon className="w-6 h-6 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center px-4 py-3 bg-blue-900 dark:bg-[#283593] rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <button
                onClick={logout}
                className="text-xs text-blue-300 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
      {/* Chatbot */}
      {chatOpen ? (
        <ChatbotWindow onClose={() => setChatOpen(false)} />
      ) : (
        <ChatbotButton onClick={() => setChatOpen(true)} />
      )}
    </div>
  );
}

export default Layout; 