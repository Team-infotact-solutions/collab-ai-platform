import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Whiteboard from '../components/workspace/Whiteboard';
import AIIntegration from '../components/workspace/AIIntegration';
import TaskList from '../components/workspace/TaskList';
import ChatUI from '../components/workspace/ChatUI';
import VersionHistory from '../components/workspace/VersionHistory';
import Comments from '../components/workspace/Comments.jsx';

function Workspace() {
  const { user, token } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState(null); // Track selected task

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 mt-10">Access Denied</h2>
        <p>Please log in to access your workspace.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 mt-10">
        Welcome, {user.name || user.email}!
      </h1>
      <p className="mb-4">Manage your projects, AI ideas, and tasks here.</p>

      <Whiteboard />
      <AIIntegration />

      {/* Pass callbacks and selectedTaskId to TaskList */}
      <TaskList
        onSelectTask={(taskId) => setSelectedTaskId(taskId)}
        selectedTaskId={selectedTaskId}
      />

      <ChatUI />
      <VersionHistory />

      {/* Pass selectedTaskId and token to Comments */}
      {selectedTaskId && <Comments taskId={selectedTaskId} token={token} />}
    </div>
  );
}

export default Workspace;
