const express = require('express');
const router = express.Router();
const Version = require('../models/versionModel'); // ✅ consistent name
const auth = require('../middleware/auth');

// 📜 Get ALL versions (for all projects, optional endpoint)
router.get('/', auth(), async (req, res) => {
  try {
    const versions = await Version.find()
      .populate('createdBy', 'name email')
      .populate('projectId', 'name'); // populate project if needed
    res.json(versions);
  } catch (err) {
    console.error('❌ Error fetching all versions:', err.message);
    res.status(500).json({ message: 'Failed to fetch versions' });
  }
});

// 📜 Get all versions for a single project
router.get('/:projectId', auth(), async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const versions = await Version.find({ projectId })
      .populate('createdBy', 'name email');

    res.json(versions);
  } catch (err) {
    console.error('❌ Error fetching versions by project:', err.message);
    res.status(500).json({ message: 'Failed to fetch versions' });
  }
});

// ➕ Add a new version for a project
router.post('/:projectId', auth(), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Version text is required' });
    }

    const newVersion = new Version({
      projectId,
      text,
      createdBy: req.user.id,
    });

    const saved = await newVersion.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error creating version:', err.message);
    res.status(500).json({ message: 'Failed to create version' });
  }
});

module.exports = router;
