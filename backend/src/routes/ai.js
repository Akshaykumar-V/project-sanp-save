const express = require('express');
const router = express.Router();
const { generateFinancialTips } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// POST /api/ai/tips - Generate personalized financial tips
router.post('/tips', generateFinancialTips);

module.exports = router;
