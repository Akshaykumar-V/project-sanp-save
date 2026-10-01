const { buildFinancialPrompt } = require('./aiPromptService');
const { generateRecommendation } = require('./ai/geminiProvider');

const REQUIRED_FIELDS = [
  'type',
  'title',
  'message',
  'evidence',
  'action',
];

function validateRecommendation(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }

  return REQUIRED_FIELDS.every(
    (field) =>
      Object.prototype.hasOwnProperty.call(item, field) &&
      typeof item[field] === 'string' &&
      item[field].trim().length > 0
  );
}

function parseRecommendations(rawResponse) {
  if (typeof rawResponse !== 'string') {
    throw new Error('AI response must be a string');
  }

  let parsed;

  try {
    parsed = JSON.parse(rawResponse);
  } catch (error) {
    throw new Error('AI response is not valid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response must be a JSON array');
  }

  const valid = parsed.filter(validateRecommendation);

  if (valid.length !== parsed.length) {
    throw new Error('AI response contains invalid recommendation objects');
  }

  return valid;
}

async function generateFinancialRecommendations(context = {}) {
  const { systemPrompt, userPrompt } = buildFinancialPrompt(context);

  const prompt = `${systemPrompt}\n\nFinancial context:\n${userPrompt}`;

  const rawResponse = await generateRecommendation(prompt);

  return parseRecommendations(rawResponse);
}

module.exports = {
  validateRecommendation,
  parseRecommendations,
  generateFinancialRecommendations,
};