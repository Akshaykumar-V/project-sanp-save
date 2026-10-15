const { GoogleGenAI } = require('@google/genai');

const MODEL = 'gemini-3.8-flash';

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function isRetryableError(error) {
  const message = error?.message || '';

  return (
    message.includes('"code":503') ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand')
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateRecommendation(prompt, options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('A valid prompt is required');
  }

  const ai = getGeminiClient();

  const maxRetries = options.maxRetries ?? 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return response.text;
    } catch (error) {
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;
      attempt += 1;

      await wait(delay);
    }
  }
}

module.exports = {
  generateRecommendation,
};
