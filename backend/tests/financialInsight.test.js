const {
  buildFinancialInsights,
} = require('../src/services/financialInsightService');

describe('financialInsightService', () => {
  test('detects spending increase', () => {
    const insights = buildFinancialInsights({
      comparisons: [
        {
          entityKey: 'Amruth Tea',
          previousAmount: 220,
          currentAmount: 420,
          changeAmount: 200,
          changePercentage: 90.91,
        },
      ],
    });

    expect(insights).toContainEqual(
      expect.objectContaining({
        type: 'SPENDING_INCREASE',
        entityKey: 'Amruth Tea',
        changeAmount: 200,
      })
    );
  });

  test('detects new spending entity', () => {
    const insights = buildFinancialInsights({
      comparisons: [
        {
          entityKey: 'New Merchant',
          previousAmount: 0,
          currentAmount: 250,
          changeAmount: 250,
          changePercentage: null,
        },
      ],
    });

    expect(insights).toContainEqual(
      expect.objectContaining({
        type: 'NEW_SPENDING',
        entityKey: 'New Merchant',
      })
    );
  });

  test('detects repeated spending', () => {
    const insights = buildFinancialInsights({
      patterns: {
        entityPatterns: [
          {
            entityKey: 'Amruth Tea',
            count: 5,
            totalAmount: 250,
            averageAmount: 50,
          },
        ],
      },
    });

    expect(insights).toContainEqual(
      expect.objectContaining({
        type: 'REPEATED_SPENDING',
        entityKey: 'Amruth Tea',
        count: 5,
      })
    );
  });

  test('detects small payment pattern', () => {
    const insights = buildFinancialInsights({
      patterns: {
        smallPaymentPattern: {
          threshold: 100,
          count: 8,
          totalAmount: 420,
          averageAmount: 52.5,
        },
      },
    });

    expect(insights).toContainEqual(
      expect.objectContaining({
        type: 'SMALL_PAYMENT_PATTERN',
        count: 8,
        totalAmount: 420,
      })
    );
  });

  test('includes spending profile context', () => {
    const insights = buildFinancialInsights({
      profile: {
        totalSpent: 5000,
        expenseCount: 20,
        averageExpense: 250,
        largestExpense: 1000,
      },
    });

    expect(insights).toContainEqual(
      expect.objectContaining({
        type: 'SPENDING_PROFILE',
        totalSpent: 5000,
      })
    );
  });

  test('does not create an insight for decreased spending', () => {
    const insights = buildFinancialInsights({
      comparisons: [
        {
          entityKey: 'Zomato',
          previousAmount: 500,
          currentAmount: 300,
          changeAmount: -200,
          changePercentage: -40,
        },
      ],
    });

    expect(insights).toHaveLength(0);
  });
});

test('ignores insignificant spending increases', () => {
  const insights = buildFinancialInsights({
    comparisons: [
      {
        entityKey: 'Small Change',
        previousAmount: 500,
        currentAmount: 510,
        changeAmount: 10,
        changePercentage: 2,
      },
    ],
  });

  expect(insights).toHaveLength(0);
});