const express = require('express');
const { register, login, me, updateMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

module.exports = router;
