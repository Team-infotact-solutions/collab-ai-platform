const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.post('/', auth(['admin']), createProject);
router.get('/', auth(), getProjects);

module.exports = router;
