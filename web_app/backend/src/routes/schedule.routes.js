const express = require('express');
const {
  tutupSlot, checkAvailability, holdSlot, listMySchedules, bukaSlot,
} = require('../controllers/schedule.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, requireRole('vendor_owner'), listMySchedules);
router.post('/check', checkAvailability);
router.post('/hold', requireAuth, holdSlot);
router.post('/', requireAuth, requireRole('vendor_owner'), tutupSlot);
router.delete('/:scheduleId', requireAuth, requireRole('vendor_owner'), bukaSlot);

module.exports = router;
