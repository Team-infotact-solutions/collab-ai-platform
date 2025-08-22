const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { getMe } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth(), getMe);   

module.exports = router;
