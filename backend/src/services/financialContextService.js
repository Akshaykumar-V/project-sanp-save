const { buildFinancialInsights } = require('./financialInsightService');

function buildFinancialContext({
  profile = {},
  patterns = {},
  comparisons = [],
} = {}) {
  const insights = buildFinancialInsights({
    profile,
    patterns,
    comparisons,
  });

  return {
    profile,
    patterns,
    comparisons,
    insights,
  };
}

module.exports = {
  buildFinancialContext,
};