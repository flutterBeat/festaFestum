const express = require('express');
const {
  createBooking, listMyBookings, getBooking,
  listVendorBookings, vendorStats, vendorBalance,
} = require('../controllers/booking.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute /vendor didaftarkan SEBELUM /:bookingId, kalau tidak "vendor" akan
// ditangkap sebagai bookingId dan balasannya jadi 404.
router.get('/vendor', requireAuth, requireRole('vendor_owner'), listVendorBookings);
router.get('/vendor/stats', requireAuth, requireRole('vendor_owner'), vendorStats);
router.get('/vendor/balance', requireAuth, requireRole('vendor_owner'), vendorBalance);

router.get('/', requireAuth, listMyBookings);
router.post('/', requireAuth, createBooking);
router.get('/:bookingId', requireAuth, getBooking);

module.exports = router;
