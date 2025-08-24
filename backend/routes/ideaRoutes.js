// backend/routes/ideaRoutes.js
const express = require('express');
const router = express.Router();
const { generateIdeas } = require('../controllers/ideaController');

router.post('/', generateIdeas);

module.exports = router;
