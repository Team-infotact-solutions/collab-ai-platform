import React, { createContext, useContext, useState } from 'react';
import api from '../services/api'; // axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null; // safe fallback if JSON is invalid
    }
  });

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      const token = res.data?.token;
      const userData = res.data?.user;

      if (!token || !userData) {
        console.error('Login response invalid:', res.data);
        throw new Error('Invalid response from server');
      }

      // Save token & user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('role', userData.role);

      setUser(userData);
      return userData; // optional
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
