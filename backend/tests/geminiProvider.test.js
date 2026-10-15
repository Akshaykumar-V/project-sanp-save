jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(),
}));

const { GoogleGenAI } = require('@google/genai');
const { generateRecommendation } = require('../src/services/ai/geminiProvider');

describe('generateRecommendation', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    jest.clearAllMocks();
  });

  test('rejects an invalid prompt', async () => {
    await expect(generateRecommendation('')).rejects.toThrow(
      'A valid prompt is required'
    );
  });

  test('rejects when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(generateRecommendation('test prompt')).rejects.toThrow(
      'GEMINI_API_KEY is not configured'
    );
  });

  test('returns the Gemini response text', async () => {
    const generateContent = jest.fn().mockResolvedValue({
      text: '{"recommendation":"Reduce food spending"}',
    });

    GoogleGenAI.mockImplementation(() => ({
      models: { generateContent },
    }));

    const result = await generateRecommendation(
      'Give me a spending recommendation'
    );

    expect(result).toBe('{"recommendation":"Reduce food spending"}');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  test('retries a temporary 503 error', async () => {
    const generateContent = jest.fn()
      .mockRejectedValueOnce(new Error('503 UNAVAILABLE'))
      .mockResolvedValueOnce({
        text: '{"recommendation":"Retry worked"}',
      });

    GoogleGenAI.mockImplementation(() => ({
      models: { generateContent },
    }));

    const result = await generateRecommendation('Retry this request');

    expect(result).toBe('{"recommendation":"Retry worked"}');
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  test('does not retry non-retryable errors', async () => {
    const generateContent = jest.fn()
      .mockRejectedValue(new Error('Invalid request'));

    GoogleGenAI.mockImplementation(() => ({
      models: { generateContent },
    }));

    await expect(
      generateRecommendation('Invalid request test')
    ).rejects.toThrow('Invalid request');

    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
