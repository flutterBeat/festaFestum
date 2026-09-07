const express = require('express');
const { updateService, deactivateService } = require('../controllers/service.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/:serviceId', requireAuth, requireRole('vendor_owner'), updateService);
router.delete('/:serviceId', requireAuth, requireRole('vendor_owner'), deactivateService);

module.exports = router;
