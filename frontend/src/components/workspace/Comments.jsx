import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Comments({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (taskId) fetchComments();
    else setComments([]);
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.getComments(taskId);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Fetch comments failed:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!text.trim()) return;
    setErrorMsg("");
    try {
      await api.createComment(taskId, { text });
      setText("");
      await fetchComments();
    } catch (err) {
      console.error("❌ Add comment failed:", err);
      setErrorMsg(err.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteComment = async (commentId, commentOwnerId) => {
    if (!(user.role === "admin" || user._id === commentOwnerId)) {
      setErrorMsg("You are not authorized to delete this comment");
      return;
    }
    try {
      await api.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error("❌ Delete comment failed:", err);
      setErrorMsg(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
      <h4 className="text-lg font-semibold mb-3 border-b pb-1">💬 Comments</h4>

      {errorMsg && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}

      {loading ? (
        <p className="text-gray-500 italic">Loading comments...</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <li
                key={c._id}
                className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow relative"
              >
                <p className="text-gray-800">{c.text}</p>
                <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                  <span>{c.createdBy?.name || "User"}</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                  {(user.role === "admin" || user._id === c.createdBy?._id) && (
                    <button
                      className="ml-2 px-2 py-1 text-xs text-red-600 hover:underline"
                      onClick={() => deleteComment(c._id, c.createdBy?._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      <div className="flex mt-3 gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
