import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    if (!window.confirm(`Set ${user.name}'s role to ${newRole}?`)) return;

    try {
      await api.updateUser(user._id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error updating role:", err.response?.data || err.message);
      setError("Failed to update role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      setError("Failed to delete user");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 bg-white shadow-md rounded-xl my-4">
      <h3 className="text-xl font-semibold mb-3">👥 Users Management</h3>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <span>
                <strong>{u.name}</strong> ({u.email}) —{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    u.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {u.role}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRole(u)}
                  className={`px-2 py-1 rounded text-white transition ${
                    u.role === "admin"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {u.role === "admin" ? "Demote" : "Promote"}
                </button>
                <button
                  onClick={() => deleteUser(u._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
