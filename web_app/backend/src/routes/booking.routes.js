const express = require('express');
const { createBooking } = require('../controllers/booking.controller');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, createBooking);

module.exports = router;
