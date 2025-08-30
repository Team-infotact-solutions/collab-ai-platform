const express = require("express");
const router = express.Router();
const Comment = require("../models/commentModel");
const auth = require("../middleware/auth");

// 📜 Get all comments for a task
router.get("/:taskId", auth(), async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate("createdBy", "name email");
    res.json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// ➕ Add new comment
router.post("/:taskId", auth(), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const newComment = new Comment({
      taskId: req.params.taskId,
      text,
      createdBy: req.user.id,
    });

    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating comment:", err.message);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

// ❌ Delete comment
router.delete("/:id", auth(), async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err.message);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

module.exports = router;
