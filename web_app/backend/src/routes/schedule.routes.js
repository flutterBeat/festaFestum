const express = require('express');
const { setSchedules, checkAvailability, holdSlot } = require('../controllers/schedule.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/check', checkAvailability);
router.post('/hold', requireAuth, holdSlot);
router.post('/', requireAuth, requireRole('vendor_owner'), setSchedules);

module.exports = router;
