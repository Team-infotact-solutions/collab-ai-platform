import React, { useState } from "react";

function VersionHistory() {
  const [versions, setVersions] = useState([
    { id: 1, text: "Initial draft created", time: "10:00 AM" },
    { id: 2, text: "Added introduction", time: "10:30 AM" },
  ]);

  return (
    <div className="p-4 border rounded my-4">
      <h3 className="text-xl font-semibold mb-2">📜 Document Version History</h3>
      <ul className="space-y-2">
        {versions.map((v) => (
          <li key={v.id} className="border p-2 rounded bg-gray-50">
            <p className="text-gray-800">{v.text}</p>
            <p className="text-xs text-gray-500">{v.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VersionHistory;
