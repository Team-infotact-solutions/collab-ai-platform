// backend/controllers/taskController.js
const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const payload = {
      title:       req.body.title,
      description: req.body.description || '',
      status:      req.body.status || 'todo',
      priority:    req.body.priority || 'medium',
      dueDate:     req.body.dueDate,
      assignedTo:  req.body.assignedTo,
      createdBy:   req.user.id,               // from auth middleware
    };

    if (!payload.title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create(payload);
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Create Task Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// List tasks (admin sees all; member sees own/assigned)
exports.getTasks = async (req, res) => {
  try {
    const query = (req.user.role === 'admin')
      ? {}
      : { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Get Tasks Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one task by ID
exports.getTaskById = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!t) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' &&
        t.createdBy._id.toString() !== req.user.id &&
        t.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(t);
  } catch (err) {
    console.error('Get Task Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' &&
        t.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fields = ['title','description','status','priority','dueDate','assignedTo'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) t[f] = req.body[f];
    });

    await t.save();

    const updated = await Task.findById(t._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (err) {
    console.error('Update Task Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a single task
exports.deleteTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' &&
        t.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await t.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete Task Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear all tasks (admin sees all; user deletes own tasks)
exports.clearAllTasks = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      await Task.deleteMany({});
    } else {
      await Task.deleteMany({ createdBy: req.user.id });
    }
    res.json({ message: 'All tasks cleared' });
  } catch (err) {
    console.error('Clear All Tasks Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
