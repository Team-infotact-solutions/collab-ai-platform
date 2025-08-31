const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Role management
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },

    // Analytics / Activity tracking
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    projectsCreated: { type: Number, default: 0 },
    tasksCreated: { type: Number, default: 0 },
    ideasGenerated: { type: Number, default: 0 },

    // Optional profile fields
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

// Middleware to track login
userSchema.methods.recordLogin = async function () {
  this.loginCount += 1;
  this.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
