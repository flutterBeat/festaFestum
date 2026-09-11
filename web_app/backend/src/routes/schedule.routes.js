const express = require('express');
const {
  setSchedules, checkAvailability, holdSlot, listMySchedules, deleteSchedule,
} = require('../controllers/schedule.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, requireRole('vendor_owner'), listMySchedules);
router.post('/check', checkAvailability);
router.post('/hold', requireAuth, holdSlot);
router.post('/', requireAuth, requireRole('vendor_owner'), setSchedules);
router.delete('/:scheduleId', requireAuth, requireRole('vendor_owner'), deleteSchedule);

module.exports = router;
