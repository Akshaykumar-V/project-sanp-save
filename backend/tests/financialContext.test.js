const {
  buildFinancialContext,
} = require('../src/services/financialContextService');

describe('financialContextService', () => {
  test('builds complete financial context', () => {
    const profile = {
      totalSpent: 5000,
      expenseCount: 20,
      averageExpense: 250,
    };

    const patterns = {
      entityPatterns: [
        {
          entityKey: 'Amruth Tea',
          count: 5,
          totalAmount: 250,
          averageAmount: 50,
        },
      ],
      smallPaymentPattern: {
        threshold: 100,
        count: 8,
        totalAmount: 420,
        averageAmount: 52.5,
      },
    };

    const comparisons = [
      {
        entityKey: 'Amruth Tea',
        previousAmount: 220,
        currentAmount: 420,
        changeAmount: 200,
        changePercentage: 90.91,
      },
    ];

    const context = buildFinancialContext({
      profile,
      patterns,
      comparisons,
    });

    expect(context.profile).toEqual(profile);
    expect(context.patterns).toEqual(patterns);
    expect(context.comparisons).toEqual(comparisons);

    expect(context.insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'SPENDING_INCREASE',
          entityKey: 'Amruth Tea',
        }),
        expect.objectContaining({
          type: 'REPEATED_SPENDING',
          entityKey: 'Amruth Tea',
        }),
        expect.objectContaining({
          type: 'SMALL_PAYMENT_PATTERN',
        }),
        expect.objectContaining({
          type: 'SPENDING_PROFILE',
        }),
      ])
    );
  });

  test('handles empty financial data', () => {
    const context = buildFinancialContext();

    expect(context.profile).toEqual({});
    expect(context.patterns).toEqual({});
    expect(context.comparisons).toEqual([]);
    expect(context.insights).toEqual([]);
  });
});