// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Home from './pages/Home.jsx';
import Workspace from './pages/Workspace.jsx';
import Welcome from './pages/Welcome.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';

import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public route accessible without login */}
        <Route path="/" element={<Home />} />

        {/* Login and Signup only for unauthenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
