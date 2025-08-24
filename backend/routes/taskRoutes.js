// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  clearAllTasks
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All Task routes are protected
router.post('/', auth(), createTask);            // Create a new task
router.get('/', auth(), getTasks);              // Get all tasks
router.get('/:id', auth(), getTaskById);        // Get task by ID
router.put('/:id', auth(), updateTask);         // Update task
router.delete('/:id', auth(), deleteTask);      // Delete single task
router.delete('/', auth(), clearAllTasks);      // Delete all tasks (optional, admin or owner)

module.exports = router;
