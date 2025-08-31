const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Comment = require("../models/Comment");
const router = express.Router();

async function getTaskAnalyticsData() {
  const total = await Task.countDocuments();
  const completed = await Task.countDocuments({ status: "completed" });
  const pending = await Task.countDocuments({ status: "pending" });
  const overdue = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $ne: "completed" },
  });
  return { total, completed, pending, overdue };
}

router.get("/summary", async (req, res) => {
  try {
    const tasks = await getTaskAnalyticsData();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalProjects = await Project.countDocuments();

    res.json({
      ...tasks,
      totalUsers,
      totalComments,
      totalProjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await getTaskAnalyticsData();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
