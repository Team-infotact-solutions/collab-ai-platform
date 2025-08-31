const Task = require("../models/Task");
const Project = require("../models/Project");

exports.getTaskAnalytics = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: "completed" });
    const pending = await Task.countDocuments({ status: "pending" });
    const overdue = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: "completed" } });
    res.json({ total, completed, pending, overdue });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task analytics" });
  }
};

exports.getProjectAnalytics = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const active = await Project.countDocuments({ status: "active" });
    const completed = await Project.countDocuments({ status: "completed" });
    res.json({ total, active, completed });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project analytics" });
  }
};
