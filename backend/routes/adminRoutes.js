// routes/adminRoutes.js
// Admin-only routes. Currently exposes the fraud/anomaly dashboard.
const express = require('express');
const router  = express.Router();

const authMiddleware  = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
  getSuspiciousUsers,
  sendWarning,
  disableUser
} = require('../controllers/fraudController');

// Protect ALL admin routes (must be logged in AND role = ADMIN)
router.use(authMiddleware);
router.use(adminMiddleware);

// ── Fraud / Anomaly Detection ────────────────────────────────
router.get('/fraud/users',    getSuspiciousUsers);
router.post('/fraud/warn',    sendWarning);
router.post('/fraud/disable', disableUser);

module.exports = router;
