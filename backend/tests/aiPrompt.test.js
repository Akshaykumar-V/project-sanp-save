const {
  buildFinancialPrompt,
} = require('../src/services/aiPromptService');

describe('AI Prompt Service', () => {
  test('should build a financial prompt from structured context', () => {
    const context = {
      profile: {
        totalSpent: 1000,
        expenseCount: 10,
        averageExpense: 100,
      },
      patterns: {
        entityPatterns: [
          {
            entityKey: 'amruth_tea',
            count: 5,
            totalAmount: 250,
            averageAmount: 50,
          },
        ],
      },
      comparisons: [],
      insights: [],
    };

    const result = buildFinancialPrompt(context);

    expect(result).toHaveProperty('systemPrompt');
    expect(result).toHaveProperty('userPrompt');

    expect(result.systemPrompt).toContain(
      'personal financial guidance assistant'
    );

    expect(result.userPrompt).toContain('amruth_tea');
    expect(result.userPrompt).toContain('1000');
  });

  test('should include financial insights in the AI prompt', () => {
    const context = {
      profile: {
        totalSpent: 1500,
      },
      patterns: {},
      comparisons: [],
      insights: [
        {
          type: 'SPENDING_INCREASE',
          entityKey: 'zomato',
          changeAmount: 200,
        },
      ],
    };

    const result = buildFinancialPrompt(context);

    expect(result.userPrompt).toContain('SPENDING_INCREASE');
    expect(result.userPrompt).toContain('zomato');
    expect(result.userPrompt).toContain('200');
  });

  test('should handle empty financial context', () => {
    const result = buildFinancialPrompt();

    expect(result).toHaveProperty('systemPrompt');
    expect(result).toHaveProperty('userPrompt');

    expect(result.systemPrompt.length).toBeGreaterThan(0);
    expect(result.userPrompt).toBe(
      JSON.stringify({
        profile: {},
        patterns: {},
        comparisons: [],
        insights: [],
      })
    );
  });

  test('should instruct AI not to invent financial information', () => {
    const result = buildFinancialPrompt({});

    expect(result.systemPrompt).toContain(
      'Do not invent missing information'
    );

    expect(result.systemPrompt).toContain(
      'Do not label any transaction as wasteful'
    );
  });
});
test('should instruct AI to return structured recommendations', () => {
  const result = buildFinancialPrompt({
    profile: {
      totalSpent: 2000,
    },
  });

  expect(result.systemPrompt).toContain(
    'Return recommendations as a JSON array'
  );

  expect(result.systemPrompt).toContain(
    'type, title, message, evidence, and action'
  );

  expect(result.systemPrompt).toContain(
    'evidence must only use values present'
  );
});