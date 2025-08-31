const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo || null,
      project: req.body.project || null,
      createdBy: req.user.id,
    };

    if (!payload.title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create(payload);

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Error creating task:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List tasks
exports.getTasks = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('❌ Error fetching tasks:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (err) {
    console.error('❌ Error fetching task by ID:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'project'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating task:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('❌ Error deleting task:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Clear all tasks
exports.clearAllTasks = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      await Task.deleteMany({});
    } else {
      await Task.deleteMany({ createdBy: req.user.id });
    }
    res.json({ message: 'All tasks cleared' });
  } catch (err) {
    console.error('❌ Error clearing tasks:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
