const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

const router = express.Router();

// ----- USERS -----
router.get("/users", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/users/:id", auth(["admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- TASKS -----
router.get("/tasks", auth(["admin"]), async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email")   // creator info
      .populate("assignedTo", "name email")  // assigned user info
      .populate("project", "title");         // optional: project title
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message || "Failed to fetch tasks" });
  }
});

router.delete("/tasks/:id", auth(["admin"]), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- COMMENTS -----
router.get("/comments", auth(["admin"]), async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "name email")
      .populate("task", "title");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/comments/:id", auth(["admin"]), async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
