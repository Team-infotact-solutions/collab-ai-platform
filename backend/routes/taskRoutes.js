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

router.post('/', auth(), createTask);
router.get('/', auth(), getTasks);
router.get('/:id', auth(), getTaskById);
router.put('/:id', auth(), updateTask);
router.delete('/:id', auth(), deleteTask);
router.delete('/', auth(), clearAllTasks);

module.exports = router;
