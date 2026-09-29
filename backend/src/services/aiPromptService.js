function buildFinancialPrompt(context = {}) {
  const {
    profile = {},
    patterns = {},
    comparisons = [],
    insights = [],
  } = context;

  const systemPrompt = [
    'You are a personal financial guidance assistant for SnapSave.',
    'Use only the financial data provided in the context.',
    'Do not invent missing information or assume the reason for a transaction.',
    'Do not label any transaction as wasteful without sufficient evidence.',
    'Describe spending patterns as observations.',
    'Give practical and realistic suggestions based on the user’s own spending history.',
    'Keep recommendations concise and actionable.',
  ].join(' ');

  const userPrompt = JSON.stringify({
    profile,
    patterns,
    comparisons,
    insights,
  });

  return {
    systemPrompt,
    userPrompt,
  };
}

module.exports = {
  buildFinancialPrompt,
};