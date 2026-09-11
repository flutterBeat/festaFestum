const express = require('express');
const {
  charge, webhook, listByBooking, simulate,
} = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Webhook didaftarkan paling atas dan SENGAJA tanpa requireAuth: yang memanggil
// Midtrans, bukan browser user. Penjaganya verifikasi signature di controller.
router.post('/webhook', webhook);

router.post('/charge', requireAuth, charge);
router.get('/booking/:bookingId', requireAuth, listByBooking);
router.post('/:paymentId/simulate', requireAuth, simulate);

module.exports = router;
