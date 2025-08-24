const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const ideaRoutes = require('./routes/ideaRoutes');

// Load environment variables first
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/ideas', ideaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('whiteboard:join', (data) => {
    const boardId = data?.boardId || 'global';
    socket.join(boardId);
    console.log(`📋 Socket ${socket.id} joined board: ${boardId}`);
  });

  socket.on('whiteboard:draw', (data) => {
    const { boardId = 'global', stroke } = data;
    if (stroke) {
      socket.to(boardId).emit('whiteboard:draw', { stroke });
    }
  });

  socket.on('whiteboard:clear', (data) => {
    const { boardId = 'global' } = data;
    socket.to(boardId).emit('whiteboard:clear', {});
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes - FIXED VERSION
app.use('*catchAll', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
});
