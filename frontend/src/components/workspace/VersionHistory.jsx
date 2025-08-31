import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function VersionHistory({ taskId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskId) fetchVersions();
  }, [taskId]);

  const fetchVersions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getVersions(taskId); // ✅ use api helper
      setVersions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Fetch versions failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded my-4 bg-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">📜 Document Version History</h3>

      {loading && <p className="text-gray-500 italic">Loading...</p>}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      {versions.length > 0 && (
        <button
          onClick={fetchVersions}
          className="mb-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      )}

      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {versions.length === 0 && !loading && (
          <p className="text-gray-400 italic">No version history available.</p>
        )}
        {versions.map((v) => (
          <li key={v._id || v.id} className="border p-2 rounded bg-gray-50">
            <p className="text-gray-800">{v.text}</p>
            <p className="text-xs text-gray-500">
              {v.time ? new Date(v.time).toLocaleString() : 'Unknown time'}
              {v.user && ` • by ${v.user.name || v.user.username || v.user.email || 'User'}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VersionHistory;
