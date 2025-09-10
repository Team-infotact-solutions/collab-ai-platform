const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");


dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/versions", require("./routes/versionRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));


app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

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
    console.log("Socket disconnected:", socket.id);
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled`);
});
