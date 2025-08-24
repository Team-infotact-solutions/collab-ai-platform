import React, { useState } from 'react';
import api from '../../services/api'; // axios instance with baseURL & token

function AIIntegration() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateIdea = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setIdeas([]);

    try {
      const res = await api.post('/ideas', { topic: input });
      if (res.data?.ideas?.length) {
        setIdeas(res.data.ideas);
      } else {
        setErrorMsg('No ideas generated.');
      }
      setInput('');
    } catch (err) {
      console.error('AI Idea generation failed:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || 'Failed to generate idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg my-6">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">
        🤖 AI Idea Integration
      </h2>

      {/* Input and Button */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          placeholder="💭 Enter a project idea..."
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={generateIdea}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}

      {/* AI Output */}
      {ideas.length > 0 && (
        <ul className="space-y-2">
          {ideas.map((idea, index) => (
            <li
              key={index}
              className="p-3 bg-gray-100 border-l-4 border-purple-500 rounded-lg"
            >
              <p className="text-gray-700">{idea}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AIIntegration;
