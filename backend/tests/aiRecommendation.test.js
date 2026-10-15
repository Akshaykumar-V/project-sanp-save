const {
  validateRecommendation,
  parseRecommendations,
} = require('../src/services/aiRecommendationService');

describe('AI Recommendation Service', () => {
  test('accepts a valid recommendation', () => {
    const recommendation = {
      type: 'SPENDING_INCREASE',
      title: 'Food spending increased',
      message: 'Your food spending increased compared with the previous period.',
      evidence: 'Food spending increased by ₹200.',
      action: 'Review recent food expenses.',
    };

    expect(validateRecommendation(recommendation)).toBe(true);
  });

  test('rejects a recommendation with missing fields', () => {
    const recommendation = {
      type: 'SPENDING_INCREASE',
      title: 'Food spending increased',
      message: 'Your food spending increased.',
    };

    expect(validateRecommendation(recommendation)).toBe(false);
  });

  test('parses a valid JSON array', () => {
    const response = JSON.stringify([
      {
        type: 'SPENDING_INCREASE',
        title: 'Food spending increased',
        message: 'Food spending increased compared with the previous period.',
        evidence: 'Current spending is ₹1200.',
        action: 'Review recent food expenses.',
      },
    ]);

    expect(parseRecommendations(response)).toHaveLength(1);
  });

  test('rejects invalid JSON', () => {
    expect(() => parseRecommendations('not valid json')).toThrow(
      'AI response is not valid JSON'
    );
  });

  test('rejects a non-array response', () => {
    const response = JSON.stringify({
      type: 'SPENDING_INCREASE',
      title: 'Food spending increased',
      message: 'Food spending increased.',
      evidence: 'Current spending is ₹1200.',
      action: 'Review food expenses.',
    });

    expect(() => parseRecommendations(response)).toThrow(
      'AI response must be a JSON array'
    );
  });

  test('rejects an array containing an invalid recommendation', () => {
    const response = JSON.stringify([
      {
        type: 'SPENDING_INCREASE',
        title: 'Food spending increased',
        message: 'Food spending increased.',
      },
    ]);

    expect(() => parseRecommendations(response)).toThrow(
      'AI response contains invalid recommendation objects'
    );
  });

  test('accepts multiple valid recommendations', () => {
    const response = JSON.stringify([
      {
        type: 'SPENDING_INCREASE',
        title: 'Food spending increased',
        message: 'Food spending increased.',
        evidence: 'Spending increased by ₹200.',
        action: 'Review food expenses.',
      },
      {
        type: 'REPEATED_SPENDING',
        title: 'Repeated merchant spending',
        message: 'A merchant appeared repeatedly.',
        evidence: 'The merchant appeared 5 times.',
        action: 'Review the repeated payments.',
      },
    ]);

    expect(parseRecommendations(response)).toHaveLength(2);
  });
});