// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      const token = res.data?.token;
      const userData = res.data?.user;

      if (!token || !userData) throw new Error('Invalid response from server');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('role', userData.role);

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  // ✅ SIGNUP
  const signup = async (name, email, password) => {
    try {
      const res = await api.signup({ name, email, password });
      const userData = res.data?.user;
      const token = res.data?.token;

      if (!userData) throw new Error('Signup failed');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('role', userData.role);

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Signup failed');
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
