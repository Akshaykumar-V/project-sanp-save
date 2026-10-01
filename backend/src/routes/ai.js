const express = require('express');
const router = express.Router();

const { generateFinancialTips } = require('../controllers/aiController');
const {
  generateRecommendations,
} = require('../controllers/aiRecommendationController');

const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// POST /api/ai/tips - Legacy Groq financial tips
router.post('/tips', generateFinancialTips);

// POST /api/ai/recommendations - Gemini financial recommendations
router.post('/recommendations', generateRecommendations);

module.exports = router;
