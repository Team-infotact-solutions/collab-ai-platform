const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  dueDate:     { type: Date },

  // Who this task is assigned to
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // The project this task belongs to (now optional)
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  // User who created the task
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Track progress updates
  progress: {
    percent: { type: Number, default: 0 }, // 0-100
    updatedAt: { type: Date, default: Date.now }
  },

  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
