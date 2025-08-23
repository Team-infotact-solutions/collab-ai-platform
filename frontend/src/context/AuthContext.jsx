// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';   // ✅ axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Load user from token if exists (refresh persistence)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Attach token to axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, []);

  // Fetch logged-in user details
  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Fetch user failed:', err.response?.data || err.message);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization']; // cleanup
      setUser(null);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;

      // ✅ Save token & attach to axios headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await fetchUser();
      alert('✅ You are logged in successfully!');
      navigate('/welcome');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed!');
    }
  };

  // Signup user
  const signup = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res.data.token;

      // ✅ Save token & attach to axios headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await fetchUser();
      alert('🎉 You are registered successfully!');
      navigate('/welcome');
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Signup failed!');
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization']; // remove token from axios
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
