const express = require('express');
const { requestPayout, listMyPayouts } = require('../controllers/payout.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Sisi vendor. Keputusannya ada di /api/v1/admin/payouts — vendor tidak
// pernah bisa menyetujui pencairannya sendiri.
router.use(requireAuth, requireRole('vendor_owner'));

router.post('/', requestPayout);
router.get('/', listMyPayouts);

module.exports = router;
