import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function CommentsTable() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAllCommentsAdmin();
      setComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err.response?.data || err.message);
      setError("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting comment:", err.response?.data || err.message);
      setError("Failed to delete comment");
    }
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 bg-white shadow-md rounded-xl my-4">
      <h3 className="text-xl font-semibold mb-3">💬 Comments Management</h3>

      {comments.length === 0 ? (
        <p className="text-gray-500">No comments found.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {comments.map((c) => (
            <li
              key={c._id}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <span>
                {c.text} •{" "}
                <span className="text-sm text-gray-500">
                  by {c.user?.name || c.createdBy?.name || "Unknown"}
                </span>
              </span>
              <button
                onClick={() => deleteComment(c._id)}
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
