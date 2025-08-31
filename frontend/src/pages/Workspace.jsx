// frontend/src/pages/Workspace.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Workspace tools
import Whiteboard from "../components/workspace/Whiteboard";
import AIIntegration from "../components/workspace/AIIntegration";
import TaskList from "../components/workspace/TaskList";
import ChatUI from "../components/workspace/ChatUI";
import VersionHistory from "../components/workspace/VersionHistory";
import Comments from "../components/workspace/Comments";

// Admin tools
import UserTable from "../components/admin/UserTable";
import TaskTable from "../components/admin/TaskTable";
import CommentsTable from "../components/admin/CommentsTable";

// Analytics Dashboard
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";

// API
import api from "../services/api";

export default function Workspace() {
  const { user, token } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all tasks for analytics + task list
  useEffect(() => {
    if (user && token) fetchTasks();
  }, [user, token]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      setError(err.response?.data?.message || "Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Unauthorized view
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 mt-10">Access Denied</h2>
        <p>Please log in to access your workspace.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-2 mt-10">
          Welcome, {user.name || user.email}!
        </h1>
        <p className="text-gray-600">
          Manage your projects, AI ideas, and tasks here.
        </p>
      </header>

      {/* Collaboration tools */}
      <section className="space-y-6">
        <Whiteboard />
        <AIIntegration />
      </section>

      {/* Task management */}
      <section className="space-y-6">
        <TaskList
          onSelectTask={setSelectedTaskId}
          selectedTaskId={selectedTaskId}
        />
        <ChatUI taskId={selectedTaskId} user={user} token={token} />
        {selectedTaskId && <Comments taskId={selectedTaskId} />}
        {selectedTaskId && <VersionHistory taskId={selectedTaskId} />}
      </section>

      {/* Admin Panel */}
      {user.role === "admin" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">🔑 Admin Panel</h2>
          <UserTable token={token} />
          <TaskTable token={token} />
          <CommentsTable token={token} />
        </section>
      )}

      {/* Analytics Dashboard */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">📊 Analytics</h2>

        {loading && <p className="text-gray-500 italic">Loading tasks...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && <AnalyticsDashboard tasks={tasks} />}
      </section>
    </div>
  );
}
