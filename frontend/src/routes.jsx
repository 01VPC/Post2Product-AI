import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import InstagramConnect from './pages/instagram/InstagramConnect';
import InstagramPosts from './pages/instagram/InstagramPosts';
import AmazonConnect from './pages/amazon/AmazonConnect';
import AmazonListings from './pages/amazon/AmazonListings';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default function Router() {
  return useRoutes([
    {
      path: '/auth',
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
      ],
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: '', element: <Navigate to="/dashboard" /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'products', element: <ProductList /> },
        { path: 'instagram', element: <InstagramConnect /> },
        { path: 'instagram/posts', element: <InstagramPosts /> },
        { path: 'amazon', element: <AmazonConnect /> },
        { path: 'amazon/listings', element: <AmazonListings /> },
        { path: 'analytics', element: <Analytics /> },
        { path: 'profile', element: <Profile /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
  ]);
}