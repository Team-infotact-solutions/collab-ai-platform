const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.post('/', auth(), createProject);
router.get('/', auth(), getProjects);
router.get('/:id', auth(), getProjectById);

module.exports = router;
