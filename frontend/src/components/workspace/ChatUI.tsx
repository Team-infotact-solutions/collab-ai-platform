import React, { useState } from "react";

function ChatUI() {
  const [messages, setMessages] = useState<{ text: string; sender: string; time: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;
    setMessages([...messages, { text: input, sender: "You", time: new Date().toLocaleTimeString() }]);
    setInput("");
  };

  return (
    <div className="p-4 border rounded my-4 h-80 flex flex-col">
      <h3 className="text-xl font-semibold mb-2">💬 Team Chat</h3>
      <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No messages yet...</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold">{msg.sender}</span>: {msg.text}
              <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          className="flex-1 border rounded-l px-2 py-1"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatUI;
