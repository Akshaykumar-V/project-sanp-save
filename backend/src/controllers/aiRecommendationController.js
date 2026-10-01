const Transaction = require('../models/Transaction');
const {
  buildSpendingProfile,
} = require('../services/spendingProfileService');
const {
  detectSpendingPatterns,
} = require('../services/spendingPatternService');
const {
  getSpendingChanges,
} = require('../services/spendingComparisonService');
const {
  buildFinancialContext,
} = require('../services/financialContextService');
const {
  generateFinancialRecommendations,
} = require('../services/aiRecommendationService');

async function generateRecommendations(req, res) {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      user: userId,
    })
      .sort({ date: 1 })
      .lean();

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        generatedAt: new Date().toISOString(),
        source: 'gemini',
        message: 'No transactions available for personalized recommendations.',
      });
    }

    const profile = buildSpendingProfile(transactions);
    const patterns = detectSpendingPatterns(transactions);

    // The first API version uses the complete available transaction history.
    // Previous/current period comparison will be added when date-range
    // intelligence is introduced.
    const comparisons = getSpendingChanges([], transactions);

    const context = buildFinancialContext({
      profile,
      patterns,
      comparisons,
    });

    const recommendations =
      await generateFinancialRecommendations(context);

    return res.status(200).json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString(),
      source: 'gemini',
    });
  } catch (error) {
    console.error(
      'AI Recommendation Generation Error:',
      error.message
    );

    if (error.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'AI recommendation service is not configured.',
      });
    }

    if (
      error.message?.includes('503') ||
      error.message?.includes('UNAVAILABLE') ||
      error.message?.includes('high demand')
    ) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.',
      });
    }

    if (error.message?.includes('AI response')) {
      return res.status(502).json({
        success: false,
        message: 'AI returned an invalid recommendation response.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate financial recommendations.',
    });
  }
}

module.exports = {
  generateRecommendations,
};