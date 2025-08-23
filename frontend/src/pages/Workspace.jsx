import React from 'react';
import { useAuth } from '../context/AuthContext';

function Workspace() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 mt-10">Access Denied</h2>
        <p>Please log in to access your workspace.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 mt-10">Welcome to Your Workspace</h1>
      <p>Hello, <strong>{user.name || user.email}</strong>! This is your dashboard area.</p>
      <p>Here you can manage your projects, view analytics, and customize your settings.</p>
    </div>
  );
}

export default Workspace;
