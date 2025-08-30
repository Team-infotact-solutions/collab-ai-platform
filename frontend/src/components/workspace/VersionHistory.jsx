import React, { useEffect, useState } from "react";
import api from "../../services/api"; 

function VersionHistory() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch versions on mount
  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/versions"); 
      setVersions(res.data || []);
    } catch (err) {
      console.error("Fetch versions failed:", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || "Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded my-4 bg-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">📜 Document Version History</h3>

      {loading && <p className="text-gray-500">Loading...</p>}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <ul className="space-y-2">
        {versions.length === 0 && !loading && (
          <p className="text-gray-400">No version history available.</p>
        )}
        {versions.map((v) => (
          <li key={v._id || v.id} className="border p-2 rounded bg-gray-50">
            <p className="text-gray-800">{v.text}</p>
            <p className="text-xs text-gray-500">
              {new Date(v.time).toLocaleString()}
              {v.user && ` • by ${v.user.username || v.user.email}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VersionHistory;
