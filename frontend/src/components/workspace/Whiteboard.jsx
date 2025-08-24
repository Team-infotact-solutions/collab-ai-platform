import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faEraser, faFont } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

// ✅ connect to backend Socket.IO server
const socket = io('http://localhost:5000');

function Whiteboard() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [eraser, setEraser] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  // ✅ Listen for incoming whiteboard events
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    socket.on('draw', ({ x, y, color, lineWidth }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    socket.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on('text', ({ text, x, y, color, fontSize }) => {
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(text, x, y);
    });

    return () => {
      socket.off('draw');
      socket.off('clear');
      socket.off('text');
    };
  }, []);

  const startDrawing = (e) => {
    if (textMode) return;
    setDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!drawing || textMode) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = eraser ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();

    // ✅ broadcast draw event
    socket.emit('draw', {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: eraser ? '#ffffff' : color,
      lineWidth
    });
  };

  const stopDrawing = () => setDrawing(false);

  const addText = (e) => {
    if (!textMode || !textInput) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    const fontSize = lineWidth * 5;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(textInput, e.clientX - rect.left, e.clientY - rect.top);

    // ✅ broadcast text event
    socket.emit('text', {
      text: textInput,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color,
      fontSize
    });

    setTextInput('');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ notify others
    socket.emit('clear');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">📝 Whiteboard</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-blue-100 p-4 rounded-lg shadow-inner mb-6">

        {/* Pen */}
        <button
          onClick={() => { setEraser(false); setTextMode(false); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${!eraser && !textMode
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-blue-600 hover:bg-blue-200'
            }`}
        >
          <FontAwesomeIcon icon={faPen} /> Pen
        </button>

        {/* Eraser */}
        <button
          onClick={() => { setEraser(true); setTextMode(false); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${eraser
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-blue-600 hover:bg-blue-200'
            }`}
        >
          <FontAwesomeIcon icon={faEraser} /> Eraser
        </button>

        {/* Text */}
        <button
          onClick={() => { setTextMode(true); setEraser(false); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${textMode
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-blue-600 hover:bg-blue-200'
            }`}
        >
          <FontAwesomeIcon icon={faFont} /> Text
        </button>

        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Pick Color"
          className="w-10 h-10 rounded border-2 border-blue-300 cursor-pointer"
        />

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="cursor-pointer"
          />
          <span className="text-blue-700 font-semibold">{lineWidth}</span>
        </div>

        {/* Text Input */}
        {textMode && (
          <input
            type="text"
            placeholder="Enter text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
        )}

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="ml-auto px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-md"
        >
          <FontAwesomeIcon icon={faTrash} /> Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-gray-50 p-3 rounded-lg shadow-inner">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="border rounded-lg shadow w-full cursor-crosshair bg-white"
          onMouseDown={textMode ? addText : startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

export default Whiteboard;
