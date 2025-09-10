// backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173" ,"https://collab-ai-platform-1-ogq5.onrender.com", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------- API Routes ------------------- //
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/versions", require("./routes/versionRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

// Admin and Analytics
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ------------------- Socket.IO ------------------- //
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io instance to app for controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // Whiteboard events
  socket.on("whiteboard:join", ({ boardId = "global" }) => {
    socket.join(boardId);
    console.log(`📋 ${socket.id} joined board: ${boardId}`);
  });

  socket.on("whiteboard:draw", ({ boardId = "global", stroke }) => {
    if (stroke) socket.to(boardId).emit("whiteboard:draw", { stroke });
  });

  socket.on("whiteboard:clear", ({ boardId = "global" }) => {
    socket.to(boardId).emit("whiteboard:clear");
  });

  // Chat events
  socket.on("chat:message", ({ room = "global", message }) => {
    if (message) {
      io.to(room).emit("chat:message", {
        message,
        sender: socket.id,
        time: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ------------------- Error Handling ------------------- //

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// ------------------- Start Server ------------------- //
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
});
