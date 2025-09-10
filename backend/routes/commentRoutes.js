const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

router.get("/task/:taskId", auth(), async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
});

router.post("/task/:taskId", auth(), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = new Comment({
      task: taskId,
      text: text.trim(),
      user: req.user.id,
    });

    const savedComment = await comment.save();
    await savedComment.populate("user", "name email");

    res.status(201).json(savedComment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ message: "Server error while creating comment" });
  }
});

router.delete("/:commentId", auth(), async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (req.user.role !== "admin" && comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.remove();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
});

module.exports = router;
