import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAllTasksAdmin();
      setTasks(res.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err.response?.data || err.message);
      setError("Failed to delete task");
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 bg-white shadow-md rounded-xl my-4">
      <h3 className="text-xl font-semibold mb-3">✅ Tasks Management</h3>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((t) => (
            <li
              key={t._id}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <span>
                <strong>{t.title}</strong> •{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    t.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : t.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.status}
                </span>
              </span>
              <button
                onClick={() => deleteTask(t._id)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
