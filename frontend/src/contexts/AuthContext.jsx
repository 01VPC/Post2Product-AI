import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setTokens, removeTokens } from '../utils/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await api.get('/api/auth/user');
          setUser(response.data.user);
        } catch (error) {
          removeTokens();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    setTokens(response.data.access_token, response.data.refresh_token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    setTokens(response.data.access_token, response.data.refresh_token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);