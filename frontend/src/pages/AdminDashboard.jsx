import React, { useEffect, useState } from "react";
import CommentsTable from "../components/admin/CommentsTable";
import TaskTable from "../components/admin/TaskTable";
import UseTable from "../components/admin/UseTable";
import AnalyticsCard from "../components/analytics/AnalyticsCard";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.getAdminStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err.response?.data || err.message);
        setError("Failed to load admin statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage teams, review analytics, and configure settings here.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard title="👥 Total Users" value={stats.totalUsers} />
        <AnalyticsCard title="📋 Total Tasks" value={stats.totalTasks} />
        <AnalyticsCard title="💬 Total Comments" value={stats.totalComments} />
      </div>

      {loading && <p className="text-gray-500 italic">Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Data Tables */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <UseTable />
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Tasks</h2>
              <TaskTable />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentsTable />
          </div>
        </>
      )}
    </div>
  );
}
